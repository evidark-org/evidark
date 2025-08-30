import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/ChatModel';
import Message from '@/models/MessageModel';

// GET /api/v1/chats/[chatId] - Get chat details
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = params;
    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'name email avatar role isOnline lastSeen')
      .populate('lastMessage');

    if (!chat || !chat.isParticipant(session.user.id)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat });

  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/v1/chats/[chatId] - Update chat
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = params;
    const { name, description, settings } = await request.json();

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(session.user.id)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Check if user has admin role in chat
    const userRole = chat.getUserRole(session.user.id);
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update chat
    if (name !== undefined) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (settings !== undefined) chat.settings = { ...chat.settings, ...settings };

    await chat.save();

    return NextResponse.json({ 
      message: 'Chat updated successfully',
      chat 
    });

  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/chats/[chatId] - Delete/Leave chat
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = params;
    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isParticipant(session.user.id)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const userRole = chat.getUserRole(session.user.id);

    // If user is admin and it's a group chat, delete the entire chat
    if (userRole === 'admin' && chat.type === 'group') {
      chat.isDeleted = true;
      await chat.save();
      
      return NextResponse.json({ message: 'Chat deleted successfully' });
    }

    // Otherwise, just remove the user from participants
    chat.participants = chat.participants.map(p => 
      p.user.toString() === session.user.id ? { ...p, isActive: false } : p
    );

    await chat.save();

    return NextResponse.json({ message: 'Left chat successfully' });

  } catch (error) {
    console.error('Error deleting/leaving chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
