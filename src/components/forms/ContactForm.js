'use client';

import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          placeholder="How can we help?"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Tell us more..."
          className={inputClass + ' resize-none'}
        />
      </div>

      {status === 'success' && (
        <p className="text-sm text-black font-medium">
          Message sent — we'll be in touch within 1–2 business days.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-gray-500">
          Something went wrong. Email us directly at{' '}
          <a href="mailto:sales@bodypharmlabs.com" className="text-black underline">
            sales@bodypharmlabs.com
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 bg-black text-white rounded-xl text-xs font-medium tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
