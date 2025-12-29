import React, { useState } from 'react';
import type { Category } from '../types';
import { categoriesAPI } from '../services/api';
import { ConfirmModal } from './ConfirmModal';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: () => void;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate, onClose }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    message: string;
  }>({ isOpen: false, id: '', message: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await categoriesAPI.create({ name: newCategoryName });
      setNewCategoryName('');
      onUpdate();
    } catch (error) {
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (cat: Category) => {
    setConfirmModal({
      isOpen: true,
      id: cat.category_id,
      message: `Are you sure you want to delete "${cat.name}"? This category will be removed from all associated habits.`
    });
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(confirmModal.id);
      onUpdate();
      setConfirmModal({ isOpen: false, id: '', message: '' });
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        {/* Create New */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name..."
            className="input-field flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '+' : 'Add'}
          </button>
        </form>

        {/* List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No categories yet.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.category_id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                <button
                  onClick={() => requestDelete(cat)}
                  className="text-gray-400 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  title="Delete Category"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Category"
        message={confirmModal.message}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: '', message: '' })}
      />
    </div>
  );
};
