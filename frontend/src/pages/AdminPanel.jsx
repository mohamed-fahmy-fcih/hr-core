import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, UserPlus, Filter, ArrowUpDown, ChevronRight, Plus, X, BarChart3, Users, AlertCircle, Settings, Edit2, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const AdminPanel = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalScore');
  const [order, setOrder] = useState('desc');
  const [sortBySkill, setSortBySkill] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [isDeptMgmtOpen, setIsDeptMgmtOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [graphDeptFilter, setGraphDeptFilter] = useState('');
  const [selectedDeptForUsers, setSelectedDeptForUsers] = useState(null);
  const [allUsersForAssignment, setAllUsersForAssignment] = useState([]);

  // New Skill Form State
  const [newSkill, setNewSkill] = useState({
    masterSkillId: '',
    rating: 5
  });
  const [skillError, setSkillError] = useState(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user',
    departmentId: ''
  });
  const [userError, setUserError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/users?sortBy=${sortBy}&order=${order}${sortBySkill ? `&sortBySkill=${sortBySkill}` : ''}${filterDept ? `&departmentId=${filterDept}` : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterSkills = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/master-skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasterSkills(res.data);
      if (res.data.length > 0) {
        setNewSkill(prev => ({ ...prev, masterSkillId: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch master skills', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const fetchDeptStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/departments/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dept stats', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMasterSkills();
    fetchDepartments();
    fetchDeptStats();
    fetchAllUsersForAssignment();
  }, [sortBy, order, sortBySkill, filterDept]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSkillError(null);
    if (!newSkill.masterSkillId) return alert('Please select a skill');
    try {
      await axios.post('http://localhost:5000/api/skills',
        { ...newSkill, userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      setNewSkill({ masterSkillId: masterSkills[0]?.id || '', rating: 5 });
      fetchUsers();
    } catch (err) {
      setSkillError(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError(null);
    try {
      await axios.post('http://localhost:5000/api/users',
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsUserModalOpen(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setUserError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUserError(null);
    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser.id}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setUserError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All their skill data will be lost.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateSkillRating = async (skillId, newRating) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/skills/${skillId}`,
        { rating: newRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state for viewingUser
      if (viewingUser) {
        const updatedSkills = viewingUser.skills.map(s => s.id === skillId ? res.data : s);
        const newTotalScore = updatedSkills.reduce((sum, s) => sum + s.calculatedScore, 0);
        setViewingUser({ ...viewingUser, skills: updatedSkills, totalScore: newTotalScore });
      }
      fetchUsers();
    } catch (err) {
      alert('Failed to update skill rating');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from the user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state for viewingUser
      if (viewingUser) {
        const updatedSkills = viewingUser.skills.filter(s => s.id !== skillId);
        const newTotalScore = updatedSkills.reduce((sum, s) => sum + s.calculatedScore, 0);
        setViewingUser({ ...viewingUser, skills: updatedSkills, totalScore: newTotalScore });
      }
      fetchUsers();
    } catch (err) {
      alert('Failed to remove skill');
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/departments', 
        { name: newDeptName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDeptName('');
      fetchDepartments();
      fetchDeptStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/departments/${editingDept.id}`,
        { name: editingDept.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingDept(null);
      fetchDepartments();
      fetchDeptStats();
      fetchUsers(); // Users might have dept name cached
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure? Users in this department will be unassigned.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
      fetchDeptStats();
      fetchUsers();
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const fetchAllUsersForAssignment = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsersForAssignment(res.data);
    } catch (err) {
      console.error('Failed to fetch all users', err);
    }
  };

  const handleToggleUserDept = async (userId, deptId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`,
        { departmentId: deptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      fetchDeptStats();
      fetchAllUsersForAssignment();
      
      // Update the modal's selected dept users locally if needed
      if (selectedDeptForUsers) {
        const updatedStats = await axios.get('http://localhost:5000/api/departments/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentDept = updatedStats.data.find(d => d.id === selectedDeptForUsers.id);
        setSelectedDeptForUsers(currentDept);
      }
    } catch (err) {
      alert('Failed to update user department');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data
  const performanceData = [...users].sort((a, b) => b.totalScore - a.totalScore).slice(0, 8).map(u => ({
    name: u.fullName.split(' ')[0], 
    score: parseFloat(u.totalScore.toFixed(1))
  }));

  const skillCounts = users.reduce((acc, user) => {
    user.skills.forEach(skill => {
      acc[skill.skillName] = (acc[skill.skillName] || 0) + 1;
    });
    return acc;
  }, {});

  const skillData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Command Center</h1>
          <p className="text-slate-500">Manage employee evaluations and skill distributions.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsDeptMgmtOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2 transition-all"
          >
            <Settings size={20} />
            <span className="font-bold">Departments</span>
          </button>
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary-100 flex items-center space-x-2 transition-all transform active:scale-[0.98]"
          >
            <UserPlus size={20} />
            <span className="font-bold">Add Employee</span>
          </button>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
            <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</p>
              <p className="text-lg font-bold text-slate-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
            placeholder="Search employees by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setOrder(order === 'asc' ? 'desc' : 'asc') }}
            className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-2 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowUpDown size={20} />
            <span className="font-medium">Sort: ascending/descending</span>
          </button>
          <select
            className="bg-white border border-slate-200 p-4 rounded-2xl text-slate-600 font-medium shadow-sm outline-none"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); if (e.target.value !== 'skillRating') setSortBySkill(''); }}
          >
            <option value="totalScore">By Performance</option>
            <option value="fullName">By Name</option>
            <option value="skillRating">By Skill Rating</option>
          </select>

          <select
            className="bg-white border border-slate-200 p-4 rounded-2xl text-slate-600 font-medium shadow-sm outline-none"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {sortBy === 'skillRating' && (
            <select
              className="bg-white border border-slate-200 p-4 rounded-2xl text-slate-600 font-medium shadow-sm outline-none animate-in fade-in slide-in-from-left-2"
              value={sortBySkill}
              onChange={(e) => setSortBySkill(e.target.value)}
            >
              <option value="">Select Skill...</option>
              {masterSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Users Table */}
      {/* Department Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
        {deptStats.map((dept) => (
          <div 
            key={dept.id} 
            onClick={() => setSelectedDeptForUsers(dept)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative cursor-pointer active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{dept.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dept.userCount} Employees</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Users size={18} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Average Performance</p>
                    <span className="text-[10px] text-primary-500 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                      View Members <ChevronRight size={10} className="ml-1" />
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(dept.avgScore, 100)}%` }}></div>
                    </div>
                    <span className="font-black text-slate-900">{dept.avgScore}</span>
                  </div>
                </div>

                {dept.topPerformer && (
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
                      {dept.topPerformer.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Top Performer</p>
                      <p className="text-xs font-bold text-slate-800">{dept.topPerformer.fullName} ({dept.topPerformer.totalScore.toFixed(1)})</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {deptStats.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No department statistics available yet. Add departments to see insights.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Dept</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Skills</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Performance</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-8 py-6 cursor-pointer" onClick={() => { setViewingUser(user); setIsProfileModalOpen(true); }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-lg group-hover:scale-110 transition-transform">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{user.fullName}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg line-clamp-1">
                    {user.department?.name || '---'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex -space-x-2">
                    {user.skills.slice(0, 3).map((s, i) => (
                      <div key={s.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" title={s.skillName}>
                        {s.skillName.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {user.skills.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                        +{user.skills.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full w-24">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(user.totalScore, 100)}%` }}></div>
                    </div>
                    <span className="font-extrabold text-slate-900">{user.totalScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setSelectedUserId(user.id); setIsModalOpen(true); }}
                      className="flex items-center space-x-1 text-primary-600 font-bold hover:text-primary-700 transition-colors bg-primary-50 px-3 py-2 rounded-xl"
                      title="Add Skill"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => { setEditingUser({ ...user, password: '' }); setIsEditUserModalOpen(true); }}
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Edit User"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Performance Leaderboard Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 flex items-center">
                <div className="w-2 h-6 bg-primary-600 rounded-full mr-3"></div>
                Performance Insights
              </h3>
              <p className="text-sm text-slate-400 font-medium">Top performing employees by total score</p>
            </div>
            <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
              <BarChart3 size={20} />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 10}}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#6366f1" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Popularity Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 flex items-center">
                <div className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></div>
                Skill Inventory
              </h3>
              <p className="text-sm text-slate-400 font-medium">Most occurring skills across the workforce</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Settings size={20} />
            </div>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="count"
                  stroke="none"
                >
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-600 font-bold text-xs ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Department Performance Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <div className="w-2 h-6 bg-emerald-600 rounded-full mr-3"></div>
              {graphDeptFilter ? `Performance: ${departments.find(d => d.id === graphDeptFilter)?.name}` : 'Department Comparison'}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              {graphDeptFilter ? 'Individual employee scores within department' : 'Average performance scores across all departments'}
            </p>
          </div>
          <select
            className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-600 font-bold text-sm outline-none"
            value={graphDeptFilter}
            onChange={(e) => setGraphDeptFilter(e.target.value)}
          >
            <option value="">All Departments (Overview)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={graphDeptFilter 
                ? users.filter(u => u.departmentId === graphDeptFilter).map(u => ({ name: u.fullName.split(' ')[0], score: u.totalScore }))
                : deptStats.map(d => ({ name: d.name, score: d.avgScore }))
              }
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
              />
              <Tooltip 
                cursor={{fill: '#f8fafc', radius: 10}}
                contentStyle={{
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px'
                }}
              />
              <Bar 
                dataKey="score" 
                fill={graphDeptFilter ? "#10b981" : "#6366f1"} 
                radius={[12, 12, 0, 0]} 
                barSize={graphDeptFilter ? 30 : 60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Skill Modal */}
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
                <h2 className="text-2xl font-bold text-slate-900">Assign New Skill</h2>
                <button
                  onClick={() => { setIsModalOpen(false); setSkillError(null); }}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {skillError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 border border-red-100 animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">{skillError}</span>
                </div>
              )}

              <form onSubmit={handleAddSkill} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Skill Definition</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newSkill.masterSkillId}
                    onChange={(e) => setNewSkill({ ...newSkill, masterSkillId: e.target.value })}
                  >
                    {masterSkills.length === 0 && <option value="">No skills defined yet</option>}
                    {masterSkills.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Weight: {s.weight}x)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Employee Rating (1-5)</label>
                  <input
                    type="number"
                    min="1" max="5"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newSkill.rating}
                    onChange={(e) => setNewSkill({ ...newSkill, rating: parseInt(e.target.value) })}
                  />
                </div>

                {newSkill.masterSkillId && (
                  <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                    <div className="flex justify-between text-sm font-bold text-primary-700">
                      <span>Projected Impact:</span>
                      <span>
                        {((newSkill.rating / 5) * (masterSkills.find(s => s.id === newSkill.masterSkillId)?.weight || 0)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98]"
                >
                  Confirm Assignment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Create New User</h2>
                <button
                  onClick={() => { setIsUserModalOpen(false); setUserError(null); }}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {userError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 border border-red-100 animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">{userError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. John Doe"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Initial Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">Employee (User)</option>
                    <option value="admin">HR Manager (Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Department</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newUser.departmentId}
                    onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                  >
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98]"
                >
                  Create Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditUserModalOpen && editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsEditUserModalOpen(false); setEditingUser(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Edit User</h2>
                <button
                  onClick={() => { setIsEditUserModalOpen(false); setEditingUser(null); setUserError(null); }}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {userError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 border border-red-100 animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">{userError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. John Doe"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="john@example.com"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Change Password (optional)</label>
                  <input
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Leave blank to keep current"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">Employee (User)</option>
                    <option value="admin">HR Manager (Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Department</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={editingUser.departmentId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                  >
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && viewingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl p-8 rounded-[2.5rem] shadow-2xl space-y-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-indigo-600"></div>

              <div className="relative flex justify-between items-start pt-4">
                <div className="flex items-end space-x-6">
                  <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
                    <div className="w-full h-full bg-primary-100 rounded-[1.25rem] flex items-center justify-center text-primary-700 text-3xl font-black">
                      {viewingUser.fullName.charAt(0)}
                    </div>
                  </div>
                  <div className="pb-2">
                    <h2 className="text-3xl font-black text-slate-900">{viewingUser.fullName}</h2>
                    <p className="text-slate-500 font-medium flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      {viewingUser.email}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Account Role</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">{viewingUser.role}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Rating</p>
                  <p className="text-lg font-bold text-primary-600">{viewingUser.totalScore.toFixed(1)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Skills Count</p>
                  <p className="text-lg font-bold text-slate-800">{viewingUser.skills.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full mr-2"></span>
                  Skill Breakdown
                </h3>
                <div className="max-h-64 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {viewingUser.skills.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium text-sm">No skills assigned yet.</p>
                    </div>
                  ) : (
                    viewingUser.skills.map((skill) => (
                      <div key={skill.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-primary-200 transition-colors group/skill">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800">{skill.skillName}</span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleUpdateSkillRating(skill.id, star)}
                                  className={`transition-all transform hover:scale-125 ${star <= skill.rating ? 'text-amber-400' : 'text-slate-200'}`}
                                >
                                  <Star size={12} fill={star <= skill.rating ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/skill:opacity-100"
                              title="Remove Skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full">
                            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${(skill.rating / 5) * 100}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Impact: {skill.weight}x</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Department Management Modal */}
      <AnimatePresence>
        {isDeptMgmtOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeptMgmtOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg p-8 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Manage Departments</h2>
                <button
                  onClick={() => setIsDeptMgmtOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateDept} className="flex gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="New department name..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 rounded-xl transition-all flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </form>

              <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    {editingDept?.id === dept.id ? (
                      <form onSubmit={handleUpdateDept} className="flex-1 flex gap-2">
                        <input
                          type="text"
                          required
                          autoFocus
                          className="flex-1 bg-white border border-primary-500 rounded-lg px-3 py-1 outline-none"
                          value={editingDept.name}
                          onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                        />
                        <button type="submit" className="text-emerald-600 font-bold text-sm">Save</button>
                        <button type="button" onClick={() => setEditingDept(null)} className="text-slate-400 font-bold text-sm">Cancel</button>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700">{dept.name}</span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingDept({ id: dept.id, name: dept.name })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(dept.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Department Users Modal */}
      <AnimatePresence>
        {selectedDeptForUsers && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeptForUsers(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl p-8 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-50 p-2.5 rounded-2xl text-primary-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedDeptForUsers.name} Members</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedDeptForUsers.userCount} Team Members</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeptForUsers(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Members */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <div className="w-1.5 h-4 bg-primary-600 rounded-full mr-2"></div>
                    Current Members
                  </h3>
                  <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                    {allUsersForAssignment.filter(u => u.departmentId === selectedDeptForUsers.id).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">No members in this department</div>
                    ) : (
                      allUsersForAssignment.filter(u => u.departmentId === selectedDeptForUsers.id).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-50 group">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold">
                              {user.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUserDept(user.id, null)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Unassign"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Assign New Members */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <div className="w-1.5 h-4 bg-emerald-600 rounded-full mr-2"></div>
                    Assign Other Employees
                  </h3>
                  <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                    {allUsersForAssignment.filter(u => u.departmentId !== selectedDeptForUsers.id).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">All employees are already in this department</div>
                    ) : (
                      allUsersForAssignment.filter(u => u.departmentId !== selectedDeptForUsers.id).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-50 group hover:border-emerald-200 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold">
                              {user.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {user.department?.name ? `In: ${user.department.name}` : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUserDept(user.id, selectedDeptForUsers.id)}
                            className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Assign to this dept"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
