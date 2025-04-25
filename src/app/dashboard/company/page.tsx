'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { getCompanyProfile, updateCompanyProfile } from '@/lib/api-client';
import { uploadCompanyLogo } from '@/lib/profile';
import Button from '@/components/Button';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function CompanyPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mission: '',
    vision: '',
    founded: '',
    services: [''],
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadCompany = async () => {
      if (user) {
        try {
          const { data, error } = await getCompanyProfile(user.id);

          if (error) {
            console.error('Error fetching company profile:', error);
            // If it's a "not found" error, we'll just start with an empty form
            if (error.message?.includes('not found')) {
              setFetchLoading(false);
              return;
            }
            setError('Failed to load company profile: ' + (error.message || 'Unknown error'));
            setFetchLoading(false);
            return;
          }

          if (data) {
            console.log('Company data loaded:', data);

            setFormData({
              name: data.name || '',
              description: data.description || '',
              mission: data.mission || '',
              vision: data.vision || '',
              founded: data.founded || '',
              services: data.services?.length > 0 ? data.services : [''],
              address: data.address || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              logo: data.logo || '',
            });

            if (data.logo) {
              setLogoPreview(data.logo);
            }
          }

          setFetchLoading(false);
        } catch (err: any) {
          console.error('Exception loading company profile:', err);
          setError('An unexpected error occurred: ' + err.message);
          setFetchLoading(false);
        }
      }
    };

    loadCompany();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = value;
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  const addService = () => {
    setFormData((prev) => ({ ...prev, services: [...prev.services, ''] }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, services: updatedServices }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) {
        throw new Error('You must be logged in to update company information');
      }

      // Filter out empty services
      const filteredServices = formData.services.filter((service) => service.trim() !== '');

      let logoUrl = formData.logo;

      // Upload new logo if provided
      if (logoFile) {
        const { url, error: uploadError } = await uploadCompanyLogo(logoFile, user.id);
        if (uploadError) {
          throw new Error('Failed to upload company logo');
        }
        if (url) {
          logoUrl = url;
        }
      }

      // Update company profile with API client
      const { data, error } = await updateCompanyProfile(user.id, {
        name: formData.name,
        description: formData.description,
        mission: formData.mission,
        vision: formData.vision,
        founded: formData.founded,
        services: filteredServices,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo: logoUrl,
      });

      if (error) {
        throw error;
      }

      setSuccess('Company information updated successfully!');
      console.log('Company profile updated successfully:', data);
    } catch (err: any) {
      console.error('Exception during company profile update:', err);
      setError(err.message || 'Failed to update company information');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
        <p className="text-gray-400 mb-8">
          Manage your company information that will be displayed on your portfolio.
        </p>
      </motion.div>

      {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6">{error}</div>}

      {success && (
        <div className="bg-green-900/50 text-green-200 p-4 rounded-md mb-6">{success}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo</label>
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <Image
                      width={400}
                      height={400}
                      src={logoPreview}
                      alt="Company logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-500">No logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm font-medium transition-colors">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Upload Logo
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Recommended size: 400x400px. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wender Tech"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="founded" className="block text-sm font-medium text-gray-300 mb-2">
                Founded Year
              </label>
              <input
                type="text"
                id="founded"
                name="founded"
                value={formData.founded}
                onChange={handleChange}
                placeholder="e.g. 2020"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="A brief description about your company and what you do"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-300 mb-2">
                Mission Statement
              </label>
              <textarea
                id="mission"
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                rows={3}
                placeholder="Your company's mission"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="vision" className="block text-sm font-medium text-gray-300 mb-2">
                Vision Statement
              </label>
              <textarea
                id="vision"
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                rows={3}
                placeholder="Your company's vision"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            {/* Contact Information */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Company address"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +55 11 98765-4321"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. contact@wendertech.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://wendertech.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Services */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Services Offered
              </label>
              <div className="space-y-3">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      placeholder="e.g. Web Development, Mobile App Development"
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium transition-colors"
                      disabled={formData.services.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addService}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium transition-colors"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
