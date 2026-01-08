import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, LogOut, Settings } from 'lucide-react';

import { checkExistingSession } from '../services/authService.js';
import { createBlog, getAllBlogs } from '../services/blogs.js';
import BlogModal from '../pages/BlogModal.jsx';
import ProfileModal from '../pages/ProfileModal.jsx'


const BlogDashboard = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalError, setModalError] = useState('');
  const [editingBlog, setEditingBlog] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const user = storedUser?.username || '';

  useEffect(() => {
    const loadBlogs = async () => {
      const t = localStorage.getItem('token');
      if (!t) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await getAllBlogs(t);
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.message === 'UNAUTHORIZED') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }
        console.log(err?.message);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [navigate]);

  const openCreateModal = () => {
    setModalError('');
    setEditingBlog(null);
    setFormData({ title: '', description: '' });
    setShowAddModal(true);
  };

  const handleEdit = (blog) => {
    setModalError('');
    setShowAddModal(false);
    setEditingBlog(blog);
    setFormData({ title: blog?.title ?? '', description: blog?.description ?? '' });
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this blog?')) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSave = async () => {
    setModalError('');

    const session = await checkExistingSession();
    if (!session?.isValid) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }

    if (editingBlog) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlog.id
            ? { ...b, title: formData.title, description: formData.description }
            : b
        )
      );
      setEditingBlog(null);
      setFormData({ title: '', description: '' });
      return;
    }

    const t = localStorage.getItem('token');
    if (!t) {
      navigate('/login', { replace: true });
      return;
    }

    const body = {
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    try {
      const created = await createBlog(body, t);
      if (created && typeof created === 'object') setBlogs((prev) => [created, ...prev]);

      setShowAddModal(false);
      setFormData({ title: '', description: '' });
    } catch (error) {
      if (error?.message === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setModalError(error?.message || 'Failed to create blog');
    }
  };

  const handleCancel = () => {
    setModalError('');
    setEditingBlog(null);
    setShowAddModal(false);
    setFormData({ title: '', description: '' });
  };

  const openProfile = async () => {
    const session = await checkExistingSession();
    if (!session?.isValid) {
      navigate('/login', { replace: true });
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setProfileForm({
      username: '',
      email: '',
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    });
    setShowProfileModal(true);
  };

  const saveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (profileForm.new_password || profileForm.confirm_new_password) {
      if (profileForm.new_password !== profileForm.confirm_new_password) {
        setProfileError('Passwords do not match.');
        return;
      }
      if (!profileForm.current_password) {
        setProfileError('Current password is required to change password.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const payload = {};
    if (profileForm.username.trim()) payload.username = profileForm.username.trim();
    if (profileForm.email.trim()) payload.email = profileForm.email.trim();
    if (profileForm.new_password.trim()) {
      payload.current_password = profileForm.current_password;
      payload.new_password = profileForm.new_password;
    }

    if (Object.keys(payload).length === 0) {
      setProfileError('No fields to update.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/auth/update_me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      if (!res.ok) {
        let msg = 'Update failed';
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch {}
        setProfileError(msg);
        return;
      }

      const data = await res.json();
      setProfileSuccess(data?.message || 'Updated successfully');

      // Update localStorage user (so Welcome text updates after refresh)
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // If your backend returns a new access token in future, support it:
      if (data?.access_token) {
        localStorage.setItem('token', data.access_token);
      }

    } catch (e) {
      setProfileError(e?.message || 'Update failed');
    }
  };

  const cancelProfile = () => {
    setShowProfileModal(false);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-5">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-5 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">📝 My Blogs</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user}</span>

            {/* NEW: Profile/Settings button */}
            <button
              onClick={openProfile}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition mb-6 font-medium"
        >
          <Plus size={20} />
          Create New Blog
        </button>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No blogs yet</h2>
            <p className="text-gray-500">Click the "Create New Blog" button to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{blog.title}</h2>
                <p className="text-gray-600 mb-5 leading-relaxed">{blog.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(blog.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition font-medium"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <BlogModal
            title="Create New Blog"
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            modalError={modalError}
          />
        )}

        {editingBlog && (
          <BlogModal
            title="Edit Blog"
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            modalError={modalError}
          />
        )}

        {showProfileModal && (
          <ProfileModal
            title="Update Profile"
            form={profileForm}
            setForm={setProfileForm}
            onSave={saveProfile}
            onCancel={cancelProfile}
            error={profileError}
            success={profileSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default BlogDashboard;
