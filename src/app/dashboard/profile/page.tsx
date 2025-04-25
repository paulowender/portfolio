'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/api-client';
import { uploadProfileImage } from '@/lib/profile';
import {
  fetchEnabledAIProviders,
  improveBioWithAI as improveBioWithAIService,
} from '@/lib/ai-providers';
import { AIProvider } from '@/types/ai';
import Button from '@/components/Button';
import TagInput from '@/components/TagInput';
import { ArrowUpTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    skills: [] as string[],
    avatarUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiProviders, setAIProviders] = useState<{ provider: AIProvider; isEnabled: boolean }[]>(
    [],
  );
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | ''>('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          // Load profile data
          const { data, error } = await getUserProfile(user.id);

          if (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile: ' + (error.message || 'Unknown error'));
            setFetchLoading(false);
            return;
          }

          if (!data) {
            console.error('No profile data returned');
            setError('Profile not found');
            setFetchLoading(false);
            return;
          }

          console.log('Profile data loaded:', data);

          setFormData({
            name: data.name || '',
            title: data.title || '',
            bio: data.bio || '',
            location: data.location || '',
            phone: data.phone || '',
            website: data.website || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
            twitter: data.twitter || '',
            skills: data.skills?.length > 0 ? data.skills : [],
            avatarUrl: data.avatarUrl || '',
          });

          if (data.avatarUrl) {
            setImagePreview(data.avatarUrl);
          }

          // Load AI providers
          try {
            const providers = await fetchEnabledAIProviders();
            setAIProviders(
              providers.map((p) => ({ provider: p.provider, isEnabled: p.isEnabled })),
            );

            // Set the first enabled provider as selected
            const firstEnabledProvider = providers.find((p) => p.isEnabled);
            if (firstEnabledProvider) {
              setSelectedProvider(firstEnabledProvider.provider);
            }
          } catch (providerErr) {
            console.error('Error fetching AI providers:', providerErr);
            // Don't show error to user, just log it
          }

          setFetchLoading(false);
        } catch (err: any) {
          console.error('Exception loading profile:', err);
          setError('An unexpected error occurred: ' + err.message);
          setFetchLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const [improvingBio, setImprovingBio] = useState(false);

  const improveBioWithAI = async () => {
    if (!formData.bio.trim()) {
      setError('Please enter some text in your bio before improving it.');
      return;
    }

    if (!selectedProvider) {
      setError('Please select an AI provider first.');
      return;
    }

    setImprovingBio(true);
    setError('');

    try {
      // Call the AI service to improve the bio
      const improvedBio = await improveBioWithAIService(
        formData.bio,
        formData.title,
        formData.skills,
        selectedProvider,
      );

      setFormData((prev) => ({ ...prev, bio: improvedBio }));
      setSuccess('Bio improved successfully!');
    } catch (error: any) {
      console.error('Error improving bio:', error);
      setError(error.message || 'Failed to improve bio. Please try again.');
    } finally {
      setImprovingBio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }

      // Skills are already filtered by the TagInput component

      let avatarUrl = formData.avatarUrl;

      // Upload new image if provided
      if (imageFile) {
        const { url, error: uploadError } = await uploadProfileImage(imageFile, user.id);
        if (uploadError) {
          throw new Error('Failed to upload profile image');
        }
        if (url) {
          avatarUrl = url;
        }
      }

      // Update profile with API client
      const { data, error } = await updateUserProfile(user.id, {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        skills: formData.skills,
        avatarUrl: avatarUrl,
      });

      if (error) {
        throw error;
      }

      setSuccess('Profile updated successfully!');
      console.log('Profile updated successfully:', data);
    } catch (err: any) {
      console.error('Exception during profile update:', err);
      setError(err.message || 'Failed to update profile');
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
        <h1 className="text-3xl font-bold mb-2">Personal Profile</h1>
        <p className="text-gray-400 mb-8">
          Update your personal information and skills that will be displayed on your portfolio.
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
            {/* Profile Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm font-medium transition-colors">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Upload Image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
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
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Professional Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                  Bio
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={improvingBio || aiProviders.length === 0}
                  >
                    <option value="">Select AI Provider</option>
                    {aiProviders.map((p) => (
                      <option key={p.provider} value={p.provider} disabled={!p.isEnabled}>
                        {p.provider.charAt(0).toUpperCase() + p.provider.slice(1)}
                        {!p.isEnabled && ' (disabled)'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={improveBioWithAI}
                    disabled={
                      improvingBio ||
                      !formData.bio.trim() ||
                      !selectedProvider ||
                      aiProviders.length === 0
                    }
                    className="flex items-center text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:opacity-50 rounded-md text-white transition-colors"
                  >
                    {improvingBio ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                        Improving...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        Improve with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="A brief description about yourself and your professional experience"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <p className="mt-1 text-xs text-gray-400">
                Use the "Improve with AI" button to enhance your bio with professional language.
              </p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. São Paulo, Brazil"
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

            {/* Social Links */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                Personal Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-2">
                Twitter/X
              </label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourusername"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <TagInput
                value={formData.skills}
                onChange={handleSkillsChange}
                placeholder="Type a skill and press Enter (e.g., React, Node.js, TypeScript)"
              />
              <p className="mt-1 text-xs text-gray-400">
                Type a skill and press Enter to add it. Click the X to remove.
              </p>
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
            <Button type="submit">
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
