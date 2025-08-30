import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/ChatModel';
import Message from '@/models/MessageModel';

// GET /api/v1/chats/[chatId]/messages - Get chat messages
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages = await Message.getChatMessages(chatId, page, limit);
    const total = await Message.countDocuments({ 
      chat: chatId, 
      isDeleted: false 
    });

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/chats/[chatId]/messages - Send message
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = await params;
    const { content, type = 'text', replyTo, attachments } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create message
    const message = new Message({
      chat: chatId,
      sender: session.user.id,
      content: content.trim(),
      type,
      replyTo,
      attachments
    });

    await message.save();
    await message.populate('sender', 'name email avatar role');
    
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    // Emit real-time message via Socket.IO
    const { getIO } = await import('@/lib/socket.js');
    try {
      const io = getIO();
      if (io) {
        io.to(`chat_${chatId}`).emit('new_message', message);
      }
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return NextResponse.json({ 
      success: true,
      message: message 
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
