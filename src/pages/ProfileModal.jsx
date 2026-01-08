import React from "react";

const ProfileModal = ({
    title,
    form,
    setForm,
    onSave,
    onCancel,
    error,
    success,
  }) => {
    const canSave =
      (form.username?.trim() || form.email?.trim() || form.new_password?.trim()) &&
      (!form.new_password || form.new_password === form.confirm_new_password);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
  
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
  
          {success && (
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}
  
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Username (optional)
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new username"
                autoFocus
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Email (optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new email"
              />
            </div>
  
            <div className="pt-2 border-t border-gray-100" />
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password (required to change password)
              </label>
              <input
                type="password"
                value={form.current_password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, current_password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Enter current password"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password (optional)
              </label>
              <input
                type="password"
                value={form.new_password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, new_password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={form.confirm_new_password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirm_new_password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm new password"
              />
              {form.new_password &&
                form.confirm_new_password &&
                form.new_password !== form.confirm_new_password && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                )}
            </div>
  
            <div className="flex gap-3 pt-2">
              <button
                onClick={onSave}
                disabled={!canSave}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Save Changes
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
  
            <p className="text-xs text-gray-500">
              Note: If your JWT uses <span className="font-mono">sub=username</span>, changing username may require re-login unless backend returns a new token.
            </p>
          </div>
        </div>
      </div>
    );
  };

export default ProfileModal;
