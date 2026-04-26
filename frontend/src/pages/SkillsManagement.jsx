import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, X, Edit2, Trash2, Shield, Settings, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SkillsManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ name: '', weight: 1 });

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/master-skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(res.data);
    } catch (err) {
      console.error('Failed to fetch skills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await axios.put(`http://localhost:5000/api/master-skills/${editingSkill.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/master-skills', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingSkill(null);
      setFormData({ name: '', weight: 1 });
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will not remove the skill from users who already have it, but it will be removed from the master list.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/master-skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSkills();
    } catch (err) {
      alert('Failed to delete skill');
    }
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({ name: skill.name, weight: skill.weight });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Inventory</h1>
          <p className="text-slate-500">Define and manage the global skill list and their impact weights.</p>
        </div>
        <button 
          onClick={() => { setEditingSkill(null); setFormData({ name: '', weight: 1 }); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary-100 flex items-center space-x-2 transition-all transform active:scale-[0.98]"
        >
          <Plus size={20} />
          <span className="font-bold">Define New Skill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-48 rounded-3xl animate-pulse border border-slate-100"></div>
          ))
        ) : skills.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Settings className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium text-lg">No skills defined yet. Start by defining your first skill.</p>
          </div>
        ) : (
          skills.map((skill) => (
            <motion.div 
              layout
              key={skill.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                  <Shield size={24} />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(skill)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(skill.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{skill.name}</h3>
              <div className="flex items-center space-x-2 text-slate-500">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Impact Weight: <span className="text-primary-600 font-bold">{skill.weight}x</span></span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingSkill ? 'Edit Skill Definition' : 'Define New Skill'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Skill Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. React.js Development"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Default Weight (1-100)</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range"
                      min="1" max="100"
                      className="flex-1 accent-primary-600"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                    />
                    <span className="bg-primary-50 text-primary-600 font-bold px-4 py-2 rounded-xl w-16 text-center">
                      {formData.weight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Higher weight means this skill has more impact on the total performance score.</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98]"
                >
                  {editingSkill ? 'Update Definition' : 'Save Definition'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsManagement;
