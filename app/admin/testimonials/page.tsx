'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Check, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  location: string;
  quote: string;
  rating: number;
  savings_amount?: string | null;
  avatar_url?: string | null;
  verified: boolean;
  featured: boolean;
  display_order: number;
  status: 'active' | 'hidden' | 'pending';
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    location: '',
    quote: '',
    rating: 5,
    savings_amount: '',
    avatar_url: '',
    verified: false,
    featured: false,
    display_order: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?limit=100');
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({ title: 'Error fetching testimonials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create testimonial');
      }

      toast({ title: 'Testimonial created successfully' });
      setShowAddForm(false);
      setFormData({
        name: '',
        role: '',
        company: '',
        location: '',
        quote: '',
        rating: 5,
        savings_amount: '',
        avatar_url: '',
        verified: false,
        featured: false,
        display_order: 0,
        status: 'active'
      });
      fetchTestimonials();
    } catch (error: any) {
      console.error('Error creating testimonial:', error);
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: number, updates: Partial<Testimonial>) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update testimonial');
      }

      toast({ title: 'Testimonial updated successfully' });
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({ title: 'Error updating testimonial', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }

      toast({ title: 'Testimonial deleted successfully' });
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({ title: 'Error deleting testimonial', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-emerald-400">Testimonials Management</h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle>Add New Testimonial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
              </div>
              <textarea
                placeholder="Quote"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                className="w-full bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Savings Amount (e.g., $2,300)"
                  value={formData.savings_amount || ''}
                  onChange={(e) => setFormData({ ...formData, savings_amount: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Avatar URL (optional)"
                  value={formData.avatar_url || ''}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded"
                  />
                  Verified
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{testimonial.name}</h3>
                      <span className="text-sm text-slate-400">
                        {testimonial.role}, {testimonial.company} ({testimonial.location})
                      </span>
                      {testimonial.verified && (
                        <span className="text-xs bg-emerald-600 px-2 py-1 rounded">Verified</span>
                      )}
                      {testimonial.featured && (
                        <span className="text-xs bg-amber-600 px-2 py-1 rounded">Featured</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        testimonial.status === 'active' ? 'bg-green-600' :
                        testimonial.status === 'hidden' ? 'bg-gray-600' : 'bg-yellow-600'
                      }`}>
                        {testimonial.status}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-2">&ldquo;{testimonial.quote}&rdquo;</p>
                    {testimonial.savings_amount && (
                      <p className="text-emerald-400 font-bold">Savings: {testimonial.savings_amount}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdate(testimonial.id, {
                        featured: !testimonial.featured
                      })}
                      variant="outline"
                      size="sm"
                    >
                      {testimonial.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      onClick={() => handleUpdate(testimonial.id, {
                        status: testimonial.status === 'active' ? 'hidden' : 'active'
                      })}
                      variant="outline"
                      size="sm"
                    >
                      {testimonial.status === 'active' ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(testimonial.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
