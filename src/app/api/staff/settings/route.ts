import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/auth/staff-auth';
import { db } from '@/lib/db';
import { agentSettingsSchema } from '@/lib/validations/agent';
import { UserRole } from '@prisma/client';

// GET /api/staff/settings - Get current user's settings
export async function GET(request: NextRequest) {
  try {
    const session = await getStaffSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with all settings
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        agentCode: true,
        licenseNumber: true,
        commissionRate: true,
        streetAddress: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        agentPreferences: true,
        workingHours: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform the data to match the expected format
    const settings = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      agentCode: user.agentCode || '',
      licenseNumber: user.licenseNumber || '',
      commissionRate: user.commissionRate || 0,
      address: {
        street: user.streetAddress || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        country: user.country || 'South Africa',
      },
      preferences: user.agentPreferences || {
        emailNotifications: true,
        smsNotifications: true,
        weeklyReports: true,
        autoFollowUp: false,
        timezone: 'Africa/Johannesburg',
        language: 'en',
      },
      workingHours: user.workingHours || {
        monday: { enabled: true, start: '08:00', end: '17:00' },
        tuesday: { enabled: true, start: '08:00', end: '17:00' },
        wednesday: { enabled: true, start: '08:00', end: '17:00' },
        thursday: { enabled: true, start: '08:00', end: '17:00' },
        friday: { enabled: true, start: '08:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '13:00' },
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching agent settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/settings - Update current user's settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getStaffSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const validatedData = agentSettingsSchema.parse(body);

    // Check if user exists and is an agent
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only agents can update agent-specific settings
    if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Only agents can update agent settings' },
        { status: 403 }
      );
    }

    // Check if agent code is unique (if provided and different from current)
    if (validatedData.agentCode) {
      const existingAgent = await db.user.findFirst({
        where: {
          agentCode: validatedData.agentCode,
          id: { not: user.id },
        },
      });

      if (existingAgent) {
        return NextResponse.json(
          { error: 'Agent code already exists' },
          { status: 409 }
        );
      }
    }

    // Update user settings
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        agentCode: validatedData.agentCode,
        licenseNumber: validatedData.licenseNumber,
        commissionRate: validatedData.commissionRate,
        streetAddress: validatedData.address.street,
        city: validatedData.address.city,
        province: validatedData.address.province,
        postalCode: validatedData.address.postalCode,
        country: validatedData.address.country,
        agentPreferences: validatedData.preferences,
        workingHours: validatedData.workingHours,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        agentCode: true,
        licenseNumber: true,
        commissionRate: true,
        streetAddress: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        agentPreferences: true,
        workingHours: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating agent settings:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
