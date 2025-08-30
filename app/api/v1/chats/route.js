import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/ChatModel';
import User from '@/models/UserModel';
import Message from '@/models/MessageModel';

// GET /api/v1/chats - Get user's chats
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';

    let query = {
      'participants.user': session.user.id,
      'participants.isActive': true,
      isDeleted: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'participants.user': { $in: await User.find({ 
          name: { $regex: search, $options: 'i' } 
        }).select('_id') } }
      ];
    }

    const chats = await Chat.find(query)
      .populate({
        path: 'participants.user',
        select: 'name email avatar role isOnline lastSeen'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get unread counts for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.getUnreadCount(chat._id, session.user.id);
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    const total = await Chat.countDocuments(query);

    return NextResponse.json({
      chats: chatsWithUnreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/chats - Create new chat
export async function POST(request) {
  try {
    const session = await auth();
    console.log('Chat API - Session:', session);
    
    if (!session?.user?.id) {
      console.log('Chat API - No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { type, participantIds, name, description } = await request.json();
    console.log('Chat API - Request data:', { type, participantIds, name, description });

    // Validate input
    if (!type || !participantIds || !Array.isArray(participantIds)) {
      console.log('Chat API - Validation failed:', { type, participantIds, isArray: Array.isArray(participantIds) });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // For private chats, ensure exactly 1 other participant
    if (type === 'private' && participantIds.length !== 1) {
      console.log('Chat API - Private chat validation failed:', { participantIds, length: participantIds.length });
      return NextResponse.json({ 
        error: 'Private chats must have exactly one other participant' 
      }, { status: 400 });
    }

    // Check if private chat already exists
    if (type === 'private') {
      const existingChat = await Chat.findOne({
        type: 'private',
        'participants.user': { 
          $all: [session.user.id, participantIds[0]] 
        },
        'participants.isActive': true,
        isDeleted: false
      });

      if (existingChat) {
        return NextResponse.json({ 
          error: 'Private chat already exists',
          chatId: existingChat._id 
        }, { status: 409 });
      }
    }

    // Verify all participants exist and can chat
    console.log('Chat API - Looking for participants:', participantIds);
    const participants = await User.find({
      _id: { $in: participantIds },
      role: { $in: ['user', 'guide', 'admin', 'author', 'reader'] } // All roles can chat
    });
    console.log('Chat API - Found participants:', participants.length, 'Expected:', participantIds.length);

    if (participants.length !== participantIds.length) {
      console.log('Chat API - Participants validation failed');
      return NextResponse.json({ error: 'Some participants not found' }, { status: 400 });
    }

    // Create chat participants array
    const chatParticipants = [
      { user: session.user.id, role: 'admin' }, // Creator is admin
      ...participantIds.map(id => ({ user: id, role: 'member' }))
    ];

    // Create the chat
    const chat = new Chat({
      type,
      name: type === 'group' ? name : undefined,
      description,
      participants: chatParticipants,
      createdBy: session.user.id
    });

    await chat.save();
    await chat.populate('participants.user', 'name email avatar role isOnline');

    return NextResponse.json({ 
      message: 'Chat created successfully',
      chat 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
