import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Award, Target, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Personal Performance</h1>
          <p className="text-slate-500">Welcome back, {user?.fullName}. Here is your skill breakdown.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
          <Award className="text-amber-500" size={24} />
          <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">Evaluation Status:</span>
          <span className="text-lg font-bold text-slate-900">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-3xl shadow-xl shadow-primary-100 text-white flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
            <span className="text-primary-100 text-xs font-bold uppercase tracking-widest">Total Rating</span>
          </div>
          <div>
            <h2 className="text-5xl font-extrabold mt-6">{profile?.totalScore?.toFixed(1) || '0.0'}</h2>
            <p className="text-primary-100 mt-1 opacity-80">Calculated Weighted Average</p>
          </div>
        </motion.div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <Target size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Skills Tracked</p>
              <h3 className="text-2xl font-bold text-slate-900">{profile?.skills?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
              <Star size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Avg. Rating</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {(profile?.skills?.reduce((acc, curr) => acc + curr.rating, 0) / (profile?.skills?.length || 1)).toFixed(1)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
          <span className="w-2 h-8 bg-primary-600 rounded-full mr-3"></span>
          Detailed Skillset Breakdown
        </h3>
        
        {profile?.skills?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No skills assigned yet. Contact your HR manager.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {profile?.skills?.map((skill, index) => (
              <div key={skill.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{skill.skillName}</h4>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Weight: {skill.weight}x</p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary-600 font-bold text-lg">{skill.rating}/5</span>
                    <p className="text-xs text-slate-400">Score: {skill.calculatedScore.toFixed(1)}</p>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.rating / 5) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-primary-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.4)]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
