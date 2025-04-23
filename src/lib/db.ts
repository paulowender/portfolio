import { prisma } from './prisma';
import { Prisma } from '@/generated/prisma';

// User functions
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return { data: user, error: null };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return { data: null, error };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return { data: user, error: null };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return { data: null, error };
  }
}

export async function createUser(userData: Prisma.UserCreateInput) {
  try {
    const user = await prisma.user.create({
      data: userData,
    });
    return { data: user, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
}

export async function updateUser(id: string, userData: Prisma.UserUpdateInput) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    });
    return { data: user, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
}

// Project functions
export async function getProjects(userId?: string) {
  try {
    const where = userId ? { userId } : { featured: true };
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data: projects, error: null };
  } catch (error) {
    console.error('Error getting projects:', error);
    return { data: null, error };
  }
}

export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    return { data: project, error: null };
  } catch (error) {
    console.error('Error getting project:', error);
    return { data: null, error };
  }
}

export async function createProject(projectData: Prisma.ProjectCreateInput) {
  try {
    console.log('Creating project with Prisma:', projectData);
    const project = await prisma.project.create({
      data: projectData,
    });
    console.log('Project created successfully:', project);
    return { data: project, error: null };
  } catch (error) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }
}

export async function updateProject(id: string, projectData: Prisma.ProjectUpdateInput) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: projectData,
    });
    return { data: project, error: null };
  } catch (error) {
    console.error('Error updating project:', error);
    return { data: null, error };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    return { error: null };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { error };
  }
}

// Reminder functions
export async function getReminders(userId: string) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
    return { data: reminders, error: null };
  } catch (error) {
    console.error('Error getting reminders:', error);
    return { data: null, error };
  }
}

export async function createReminder(reminderData: Prisma.ReminderCreateInput) {
  try {
    const reminder = await prisma.reminder.create({
      data: reminderData,
    });
    return { data: reminder, error: null };
  } catch (error) {
    console.error('Error creating reminder:', error);
    return { data: null, error };
  }
}

export async function updateReminder(id: string, reminderData: Prisma.ReminderUpdateInput) {
  try {
    const reminder = await prisma.reminder.update({
      where: { id },
      data: reminderData,
    });
    return { data: reminder, error: null };
  } catch (error) {
    console.error('Error updating reminder:', error);
    return { data: null, error };
  }
}

export async function deleteReminder(id: string) {
  try {
    await prisma.reminder.delete({
      where: { id },
    });
    return { error: null };
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return { error };
  }
}

// Appointment functions
export async function getAppointments(userId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    });
    return { data: appointments, error: null };
  } catch (error) {
    console.error('Error getting appointments:', error);
    return { data: null, error };
  }
}

export async function createAppointment(appointmentData: Prisma.AppointmentCreateInput) {
  try {
    const appointment = await prisma.appointment.create({
      data: appointmentData,
    });
    return { data: appointment, error: null };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { data: null, error };
  }
}

export async function updateAppointment(id: string, appointmentData: Prisma.AppointmentUpdateInput) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: appointmentData,
    });
    return { data: appointment, error: null };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { data: null, error };
  }
}

export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({
      where: { id },
    });
    return { error: null };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { error };
  }
}
