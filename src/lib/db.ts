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
  } catch (error: any) {
    console.error('Error getting projects:', error);
    return { data: null, error };
  }
}

export async function getProject(id: string) {
  try {
    console.log(`Fetching project with ID: ${id}`);

    // Add retry logic for the specific error
    let retries = 3;
    let project = null;
    let lastError = null;

    while (retries > 0) {
      try {
        project = await prisma.project.findUnique({
          where: { id },
        });
        break; // Success, exit the loop
      } catch (err: any) {
        lastError = err;
        console.error(`Error fetching project (retries left: ${retries}):`, err);

        // Check if it's the specific prepared statement error
        if (
          err.message &&
          err.message.includes('prepared statement') &&
          err.message.includes('already exists')
        ) {
          console.log('Detected prepared statement error, retrying...');
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
          retries--;
        } else {
          // For other errors, don't retry
          throw err;
        }
      }
    }

    if (project) {
      console.log('Project fetched successfully:', project.id);
      return { data: project, error: null };
    } else if (lastError) {
      console.error('Failed to fetch project after retries:', lastError);
      return { data: null, error: lastError };
    } else {
      console.log('Project not found');
      return { data: null, error: new Error('Project not found') };
    }
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
    console.log(`Updating project with ID: ${id}`);

    // Add retry logic for the specific error
    let retries = 3;
    let project = null;
    let lastError = null;

    while (retries > 0) {
      try {
        project = await prisma.project.update({
          where: { id },
          data: projectData,
        });
        break; // Success, exit the loop
      } catch (err: any) {
        lastError = err;
        console.error(`Error updating project (retries left: ${retries}):`, err);

        // Check if it's the specific prepared statement error
        if (
          err.message &&
          err.message.includes('prepared statement') &&
          err.message.includes('already exists')
        ) {
          console.log('Detected prepared statement error, retrying...');
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
          retries--;
        } else {
          // For other errors, don't retry
          throw err;
        }
      }
    }

    if (project) {
      console.log('Project updated successfully:', project.id);
      return { data: project, error: null };
    } else if (lastError) {
      console.error('Failed to update project after retries:', lastError);
      return { data: null, error: lastError };
    } else {
      console.log('Project not found for update');
      return { data: null, error: new Error('Project not found for update') };
    }
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
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { error };
  }
}

// Reminder functions
export async function getReminders(userId: string, where?: Prisma.ReminderWhereInput) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId, ...where },
      orderBy: { dueDate: 'asc' },
    });
    return { data: reminders, error: null };
  } catch (error) {
    console.error('Error getting reminders:', error);
    return { data: null, error };
  }
}

export async function getReminder(id: string) {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });
    return { data: reminder, error: null };
  } catch (error) {
    console.error('Error getting reminder:', error);
    return { data: null, error };
  }
}

export async function createReminder(reminderData: Prisma.ReminderCreateInput) {
  try {
    console.log('Creating reminder with data:', JSON.stringify(reminderData, null, 2));

    // Criar com todos os campos
    const reminder = await prisma.reminder.create({
      data: {
        title: reminderData.title,
        description: reminderData.description,
        dueDate: reminderData.dueDate,
        completed: reminderData.completed || false,
        category: reminderData.category || 'general',
        priority: reminderData.priority || 'medium',
        recurrence: reminderData.recurrence,
        recurrenceEndDate: reminderData.recurrenceEndDate,
        notifyEmail: reminderData.notifyEmail ?? true,
        notifyWhatsapp: reminderData.notifyWhatsapp ?? false,
        notifyBefore: reminderData.notifyBefore ?? 60,
        color: reminderData.color,
        user: reminderData.user,
      },
    });

    return { data: reminder, error: null };
  } catch (error) {
    console.error('Error creating reminder:', error);
    return { data: null, error };
  }
}

export async function updateReminder(id: string, reminderData: Prisma.ReminderUpdateInput) {
  try {
    console.log('Updating reminder with data:', JSON.stringify(reminderData, null, 2));

    // Atualizar com todos os campos
    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        title: reminderData.title,
        description: reminderData.description,
        dueDate: reminderData.dueDate,
        completed: reminderData.completed,
        category: reminderData.category,
        priority: reminderData.priority,
        recurrence: reminderData.recurrence,
        recurrenceEndDate: reminderData.recurrenceEndDate,
        notifyEmail: reminderData.notifyEmail,
        notifyWhatsapp: reminderData.notifyWhatsapp,
        notifyBefore: reminderData.notifyBefore,
        color: reminderData.color,
      },
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

export async function updateAppointment(
  id: string,
  appointmentData: Prisma.AppointmentUpdateInput,
) {
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
