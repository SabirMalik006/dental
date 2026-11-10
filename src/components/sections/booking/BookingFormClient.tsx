'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User, Mail, Phone, FileText, ArrowRight, ShieldCheck, MessageSquare, Hash, Users } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { Service, Doctor } from '@/types';

interface BookingFormClientProps {
  services: Service[];
  doctors: Doctor[];
}

export const BookingFormClient: React.FC<BookingFormClientProps> = ({ services, doctors }) => {
  const searchParams = useSearchParams();
  const paramService = searchParams?.get('service');
  const paramDoctor = searchParams?.get('doctor');

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');
  const [isOtherService, setIsOtherService] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9am - 12pm)');
  const [notes, setNotes] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Pre-fill service/doctor from query params
  useEffect(() => {
    if (paramService) {
      const foundService = services.find(
        (s) => s.slug === paramService || s.id === paramService || s.title.toLowerCase() === paramService.toLowerCase()
      );
      if (foundService) {
        setServiceId(foundService.id);
      }
    }
  }, [paramService, services]);

  useEffect(() => {
    if (paramDoctor) {
      const foundDoctor = doctors.find(
        (d) => d.id === paramDoctor || d.name.toLowerCase().includes(paramDoctor.toLowerCase())
      );
      if (foundDoctor) {
        setDoctorId(foundDoctor.id);
      }
    }
  }, [paramDoctor, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!patientName.trim()) return setErrorMsg('Full Name is required.');
    if (!age.trim() || Number.isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      return setErrorMsg('Valid age (1-120) is required.');
    }
    if (!gender) return setErrorMsg('Please select gender.');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErrorMsg('Valid email address is required.');
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      return setErrorMsg('Valid phone number (min 7 digits) is required.');
    }
    if (!whatsappSameAsPhone) {
      if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 7) {
        return setErrorMsg('Valid WhatsApp number (min 7 digits) is required, or check "Same as phone".');
      }
    }
    if (isOtherService) {
      if (!customTreatment.trim()) return setErrorMsg('Please type your treatment name.');
    } else if (!serviceId) {
      return setErrorMsg('Please select a service for your appointment.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          age: Number(age),
          gender,
          email,
          phone,
          whatsapp: whatsappSameAsPhone ? phone : whatsapp,
          serviceId: isOtherService ? null : serviceId,
          customTreatment: isOtherService ? customTreatment.trim() : null,
          doctorId: doctorId || null,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request appointment');
      }

      setSubmittedData(data.appointment);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceObj = services.find((s) => s.id === serviceId);
  const selectedDoctorObj = doctors.find((d) => d.id === doctorId);
  const treatmentLabel = isOtherService
    ? customTreatment.trim() || 'Other (typing...)'
    : selectedServiceObj?.title;

  return (
    <div className="bg-bg py-12 md:py-16">
      <Container className="max-w-[1020px]">
        {/* Header */}
        <div className="text-center flex flex-col items-center mb-12">
          <SectionHeading
            eyebrow="Instant Appointment Request"
            title="Book Your Personal Consultation"
            highlightedText="Consultation"
            highlightColor="teal-clean"
            subtitle="Select your preferred treatment, choice of specialist, and preferred time. Our team will contact you to confirm your exact appointment window."
            align="center"
            showDots={true}
          />
        </div>

        {/* Form Container */}
        {submittedData ? (
          /* SUCCESS STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-slate-100 flex flex-col items-center text-center max-w-xl mx-auto font-sans"
          >
            <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-serif font-bold text-3xl text-primary mb-3">
              Appointment Requested!
            </h3>
            <p className="text-sm text-body-text leading-relaxed mb-6">
              Thank you, <span className="font-bold text-slate-800">{submittedData.patientName}</span>.
              We have received your reservation request for{' '}
              <span className="font-bold text-primary">{submittedData.service?.title || submittedData.serviceTitle || 'your consultation'}</span>.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left text-xs space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-slate-800">{submittedData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="font-bold text-slate-800">
                  {submittedData.age ?? '—'} / {submittedData.gender || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-bold text-slate-800">{submittedData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Service:</span>
                <span className="font-bold text-primary">{submittedData.service?.title || submittedData.serviceTitle}</span>
              </div>
              {submittedData.doctor && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Specialist:</span>
                  <span className="font-bold text-accent">{submittedData.doctor.name}</span>
                </div>
              )}
              {submittedData.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Date:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(submittedData.preferredDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {submittedData.preferredTime && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Window:</span>
                  <span className="font-bold text-slate-800">{submittedData.preferredTime}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSubmittedData(null);
                  setPatientName('');
                  setAge('');
                  setGender('');
                  setEmail('');
                  setPhone('');
                  setWhatsappSameAsPhone(true);
                  setWhatsapp('');
                  setServiceId('');
                  setCustomTreatment('');
                  setIsOtherService(false);
                  setDoctorId('');
                  setPreferredDate('');
                  setNotes('');
                }}
                className="font-bold text-xs px-6 py-3 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
              >
                Book Another Appointment
              </button>
              <Link
                href="/"
                className="font-semibold text-xs px-6 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          /* FORM STATE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="lg:col-span-8 bg-white rounded-3xl p-7 sm:p-10 shadow-card border border-slate-100 flex flex-col gap-6 text-left font-sans"
            >
              {errorMsg && (
                <div className="p-4 rounded-xl bg-accent-soft text-accent-dark font-semibold text-xs border border-accent/20">
                  {errorMsg}
                </div>
              )}

              {/* Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Patient Full Name *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs pr-10"
                    />
                    {patientName.trim().length > 1 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center justify-center animate-fade-in pointer-events-none">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-primary" />
                    Age *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs pr-10"
                    />
                    {age.trim().length > 0 && Number(age) >= 1 && Number(age) <= 120 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center justify-center animate-fade-in pointer-events-none">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Gender *
                  </label>
                  <select
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Email Address *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs pr-10"
                    />
                    {email.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center justify-center animate-fade-in pointer-events-none">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Phone Number *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs pr-10"
                    />
                    {phone.trim().length > 0 && phone.replace(/\D/g, '').length >= 7 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center justify-center animate-fade-in pointer-events-none">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    WhatsApp Number *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={whatsappSameAsPhone ? phone : whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        disabled={whatsappSameAsPhone}
                        placeholder="WhatsApp (with country code)"
                        className={`w-full px-4 py-3 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-all duration-300 ${
                          whatsappSameAsPhone ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#F0F0F0] focus:bg-white'
                        }`}
                      />
                      {((whatsappSameAsPhone && phone.trim().length > 0 && phone.replace(/\D/g, '').length >= 7) ||
                        (!whatsappSameAsPhone && whatsapp.trim().length > 0 && whatsapp.replace(/\D/g, '').length >= 7)) && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center justify-center animate-fade-in pointer-events-none">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 whitespace-nowrap cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappSameAsPhone}
                        onChange={(e) => {
                          setWhatsappSameAsPhone(e.target.checked);
                          if (e.target.checked) setWhatsapp('');
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      Same as phone
                    </label>
                  </div>
                </div>
              </div>

              {/* Service & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide">
                    Select Treatment *
                  </label>
                  <select
                    id="serviceId"
                    required={!isOtherService}
                    value={isOtherService ? '__other__' : serviceId}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '__other__') {
                        setIsOtherService(true);
                        setServiceId('');
                      } else {
                        setIsOtherService(false);
                        setCustomTreatment('');
                        setServiceId(v);
                      }
                    }}
                    className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Select Treatment / Service --</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                    <option value="__other__">Other</option>
                  </select>
                  {isOtherService && (
                    <input
                      type="text"
                      required
                      value={customTreatment}
                      onChange={(e) => setCustomTreatment(e.target.value)}
                      placeholder="Type your treatment name..."
                      className="mt-2 px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Preferred Doctor (Optional)
                  </label>
                  <select
                    id="doctorId"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- First Available Specialist --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    Preferred Date (Optional)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs text-slate-800 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Time Preference
                  </label>
                  <select
                    id="preferredTime"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="Morning (9am - 12pm)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12pm - 4pm)">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="Evening (4pm - 7pm)">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-[#333333] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Additional Symptoms / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention any specific concerns, pain points, or previous treatment details..."
                  className="px-4 py-3 bg-[#F0F0F0] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 text-xs resize-none animate-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-fit font-bold transition-all duration-300 rounded-full text-xs px-9 py-4 bg-accent text-white hover:bg-accent-hover btn-diagonal-stripe shadow-md cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Submitting Request...' : 'Confirm Appointment Request'}
              </button>
            </motion.form>

            {/* Sidebar Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 bg-white rounded-3xl p-7 shadow-card border border-slate-100 flex flex-col gap-6 text-left font-sans"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary-light text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-base">Booking Guarantee</h4>
                  <p className="text-xs text-body-text mt-0.5">Prompt confirmation within 2 hours.</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-bg-alt/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Selected Treatment</span>
                  <span className="font-bold text-primary text-sm mt-0.5 block">
                    {treatmentLabel || 'Not Selected Yet'}
                  </span>
                </div>

                <div className="bg-bg-alt/70 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Specialist</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {selectedDoctorObj ? selectedDoctorObj.name : 'First Available Specialist'}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-body-text leading-relaxed">
                Need immediate emergency assistance? Call our direct emergency line at{' '}
                <a href="tel:+15552345678" className="font-bold text-accent hover:underline">
                  +1 (555) 234-5678
                </a>.
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BookingFormClient;
