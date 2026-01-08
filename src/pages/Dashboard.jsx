import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, LogOut } from 'lucide-react';
import { checkExistingSession } from '../services/authService.js';
import { createBlog, getAllBlogs } from '../services/blogs.js';

const BlogDashboard = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("")


  const [editingBlog, setEditingBlog] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });


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
        if (err.message === 'UNAUTHORIZED') {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [navigate]);

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({ title: blog.title ?? '', description: blog.description ?? '' });
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this blog?')) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSave = async () => {
    const session = await checkExistingSession();
    if (!session.isValid) {
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

    // Create new blog
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
      // IMPORTANT: createBlog should RETURN created blog data.
      const created = await createBlog(body, t);

      // If your backend returns { blog: {...} }, adjust:
      // const blogObj = created.blog ?? created;
      const blogObj = created?.blog ?? created;

      if (blogObj) {
        setBlogs((prev) => [blogObj, ...prev]);
      }

      setShowAddModal(false);
      setFormData({ title: '', description: '' });
    } catch (error) {
      if (error.message === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      console.log(error.message);
    }
  };

  const handleCancel = () => {
    setEditingBlog(null);
    setShowAddModal(false);
    setFormData({ title: '', description: '' });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  };

  const Modal = ({ title, onSave, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              placeholder="Enter blog description"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onSave}
              disabled={!formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Conditional rendering is OK here because hooks are already declared above
  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-5">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-5 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">📝 My Blogs</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, User</span>
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
          onClick={() => setShowAddModal(true)}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {blog.title}
                </h2>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {blog.description}
                </p>
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
          <Modal title="Create New Blog" onSave={handleSave} onCancel={handleCancel} />
        )}

        {editingBlog && (
          <Modal title="Edit Blog" onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
};

export default BlogDashboard;
