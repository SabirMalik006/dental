import prisma from '@/lib/prisma';
import { getDoctors } from '@/data/doctors';

export interface AppointmentInput {
  patientName: string;
  age?: number | null;
  gender?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  serviceId?: string | null;
  customTreatment?: string | null;
  doctorId?: string | null;
  preferredDate?: string | Date | null;
  preferredTime?: string | null;
  notes?: string | null;
}

export async function submitAppointment(data: AppointmentInput) {
  const preferredDate = data.preferredDate ? new Date(data.preferredDate) : null;
  const serviceIdClean =
    data.serviceId && data.serviceId.trim().length > 0 ? data.serviceId : null;
  const customTreatment = data.customTreatment?.trim() || null;

  if (!serviceIdClean && !customTreatment) {
    throw new Error('Service selection is required');
  }

  let serviceTitle = customTreatment || 'General Consultation';
  if (serviceIdClean) {
    const service = await prisma.service.findUnique({
      where: { id: serviceIdClean },
    });
    if (service) serviceTitle = service.title;
  }

  const doctorIdClean = data.doctorId && data.doctorId.trim().length > 0 ? data.doctorId : null;
  let doctorNameSnapshot: string | null = null;

  if (doctorIdClean) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorIdClean },
    });
    doctorNameSnapshot = doctor ? doctor.name : null;
  }

  return prisma.appointment.create({
    data: {
      patientName: data.patientName,
      age: data.age ?? null,
      gender: data.gender || null,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      serviceId: serviceIdClean,
      serviceTitle,
      doctorId: doctorIdClean,
      doctorName: doctorNameSnapshot,
      preferredDate: preferredDate && !isNaN(preferredDate.getTime()) ? preferredDate : null,
      preferredTime: data.preferredTime || null,
      notes: data.notes || null,
      status: 'pending',
      isRead: false,
    },
    include: {
      service: true,
      doctor: true,
    },
  });
}

export async function getBookableDoctors() {
  return getDoctors();
}
