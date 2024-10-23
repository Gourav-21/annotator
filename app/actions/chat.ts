'use server'

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Group, Message, UserGroup } from "@/models/chat";
import mongoose from 'mongoose';
import { getServerSession } from "next-auth";

export async function updateLastReadMessage(groupId: string, messageId: string) {
  console.log("updateLastReadMessage")

  await connectToDatabase();
  const session = await getServerSession(authOptions)
  try {
    await UserGroup.findOneAndUpdate(
      { group: groupId, user: session?.user.id },
      { lastReadMessage: messageId },
    );
  } catch (error) {
    console.error('Error updating last read message:', error);
    return { error: 'Server error' }
  }
};

export async function sendMessage(groupId: string, message: string) {
  console.log("sendMessage")

  await connectToDatabase();
  const session = await getServerSession(authOptions)
  try {
    const newMessage = await Message.create({
      group: groupId,
      sender: session?.user.id,
      content: message
    });
    await Group.updateOne({ _id: groupId }, { lastMessage: newMessage });

    return { message: JSON.stringify(newMessage) }
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Server error' }
  }
};

export async function createGroup(groupName: string, userIds: string[]) {
  console.log("createGroup")

  await connectToDatabase();
  const session = await mongoose.startSession();
  const serverSession = await getServerSession(authOptions)

  try {
    session.startTransaction();

    const newGroup = await Group.create([{
      name: groupName,
      projectManager: serverSession?.user.id,
      created_at: Date.now()
    }], { new: true, session });

    const groupId = newGroup[0]._id;

    const userGroupDocs = userIds.map(userId => ({
      user: userId,
      group: groupId,
      joined_at: Date.now()
    }));

    userGroupDocs.push({
      user: serverSession?.user.id as string,
      group: groupId,
      joined_at: Date.now()
    });

    await UserGroup.insertMany(userGroupDocs, { session });

    const group = await Group.findByIdAndUpdate(groupId, {
      $addToSet: { members: { $each: [...userIds, serverSession?.user.id] } } // Add users and project manager
    }, { new: true, session })
      .populate('members', 'name email');

    await session.commitTransaction();
    session.endSession();

    const updatedUserGroup = await UserGroup.findOne({ group: groupId, user: serverSession?.user.id });

    updatedUserGroup.group = group;

    return { success: true, message: 'Group created and users added successfully', userGroups: updatedUserGroup };

  } catch (error) {
    console.error('Error creating group and adding users:', error);
    await session.abortTransaction();
    session.endSession();
    return { success: false, error: 'Failed to create group and add multiple users' };
  }
};

export async function deleteGroup(groupId: string) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // Step 1: Delete messages associated with the group
    await Message.deleteMany({ group: groupId }, { session });

    // Step 2: Delete UserGroup entries associated with the group
    await UserGroup.deleteMany({ group: groupId }, { session });

    // Step 3: Delete the group itself
    const deletedGroup = await Group.findByIdAndDelete(groupId, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    if (!deletedGroup) {
      return { success: false, message: 'Group not found' };
    }

    return { success: true, message: 'Group and associated data deleted successfully' };

  } catch (error) {
    console.error('Error deleting group:', error);
    await session.abortTransaction();
    session.endSession();
    return { success: false, error: 'Failed to delete group and associated data' };
  }
};