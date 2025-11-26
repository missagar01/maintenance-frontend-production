import React, { useState } from "react";
import { X, Plus, User, Users, Building2, Edit2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { fetchUsers, addUser, updateUser, deleteUser } from "../api/userApi.js"; 
import { fetchDoers, addDoer, updateDoer, removeDoer } from "../api/doerApi.js";
import {
  fetchDepartments,
  addDepartment,
  updateDepartment,
  removeDepartment
} from "../api/departmentforsetting.js";


  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={() => {
                onClose();
                setEditingUser(null);
                setEditingDoer(null);
                setEditingDepartment(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

const Settings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDoerModalOpen, setIsDoerModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  const pageOptions = [
    "Dashboard",
    "Machines",
    "Assign Task",
    "Tasks",
    "Reports",
    "Settings"
  ];

  const departmentOptions = [
    "PIPE MILL ELECTRICAL",
    "IT",
    "LAB AND QUALITY CONTROL",
    "SMS ELECTRICAL",
    "PIPE MILL MAINTENANCE",
    "SMS MAINTENANCE",
    "STRIP MILL PRODUCTION",
    "STRIP MILL ELECTRICAL",
    "CCM",
    "CCM MAINTENANCE",
    "STORE",
    "ALL ELECTRICAL",
    "TRANSPORT"
  ];

  // Users state
const [users, setUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(true);


useEffect(() => {
  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      // setUsers(data);
      setUsers(
  data.map(u => ({
    ...u,
    pageAccess: u.pageAccess || u.page_access || []   // FIX ✔
  }))
);

    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  loadUsers();
}, []);





  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    pageAccess: [],
  });

  const [editingUser, setEditingUser] = useState(null);

  // Doers state
const [doers, setDoers] = useState([]);


  const [newDoer, setNewDoer] = useState({
    name: "",
    department: "",
  });

  const [editingDoer, setEditingDoer] = useState(null);

  // Departments state
const [departments, setDepartments] = useState([]);
const [newDepartment, setNewDepartment] = useState({ name: "" });
const [editingDepartment, setEditingDepartment] = useState(null);

useEffect(() => {
  const loadDepartments = async () => {
    const data = await fetchDepartments();

    setDepartments(
      data.map(d => ({
        id: d.id,
        name: d.department
      }))
    );
  };

  loadDepartments();
}, []);

  // Handle page access checkbox toggle
  const handlePageAccessToggle = (page) => {
    const currentAccess = editingUser ? editingUser.pageAccess : newUser.pageAccess;
    const updatedAccess = currentAccess.includes(page)
      ? currentAccess.filter(p => p !== page)
      : [...currentAccess, page];
    
    if (editingUser) {
      setEditingUser({ ...editingUser, pageAccess: updatedAccess });
    } else {
      setNewUser({ ...newUser, pageAccess: updatedAccess });
    }
  };


  useEffect(() => {
  const loadDoers = async () => {
    const data = await fetchDoers();
    // setDoers(data);
    setDoers(
  data.map(d => ({
    id: d.id,
    name: d.doer_name,
    department: d.department1
  }))
);

  };
  loadDoers();
}, []);

  // Handle Add/Edit User
const handleSaveUser = async () => {
  const userData = editingUser || newUser;

  if (!userData.username || !userData.password || !userData.role) {
    alert("Please fill required fields.");
    return;
  }

  try {
    if (editingUser) {
      // Update existing user
      const updated = await updateUser(editingUser.id, {
        username: editingUser.username,
        password: editingUser.password,
        role: editingUser.role,
        pageAccess: editingUser.pageAccess,
      });

      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    } else {
      // Add new user
      const created = await addUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        pageAccess: newUser.pageAccess,
      });

      setUsers([...users, created]);
    }

    // Reset and close modal
    setNewUser({ username: "", password: "", role: "user", pageAccess: [] });
    setEditingUser(null);
    setIsUserModalOpen(false);

  } catch (err) {
    console.error("Save User Error:", err);
  }
};


const handleEditUser = (user) => {
  setEditingUser({
    ...user,
    pageAccess: user.pageAccess || user.page_access || []   // FIX ✔
  });
  setIsUserModalOpen(true);
};


  // Handle Delete User
const handleDeleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    await deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
  } catch (err) {
    console.error("Delete User Error:", err);
  }
};


  // Handle Add/Edit Doer
const handleSaveDoer = async () => {
  const data = editingDoer || newDoer;

  if (!data.name || !data.department) return;

  if (editingDoer) {
    const updated = await updateDoer(editingDoer.id, {
      name: data.name,
      department1: data.department
    });

    setDoers(doers.map(d =>
      d.id === updated.id ? {
        id: updated.id,
        name: updated.doer_name,
        department: updated.department1
      } : d
    ));
  } else {
    const created = await addDoer({
      name: data.name,
      department1: data.department
    });

    setDoers([
      ...doers,
      {
        id: created.id,
        name: created.doer_name,
        department: created.department1
      }
    ]);
  }

  setNewDoer({ name: "", department: "" });
  setEditingDoer(null);
  setIsDoerModalOpen(false);
};



  // Handle Edit Doer
  const handleEditDoer = (doer) => {
    // setEditingDoer({...doer});
    setEditingDoer({
  id: doer.id,
  name: doer.name,
  department: doer.department
});
    setIsDoerModalOpen(true);
  };

  // Handle Delete Doer
const handleDeleteDoer = async (id) => {
  if (!window.confirm("Delete this Doer?")) return;

  await removeDoer(id);
  setDoers(doers.filter(d => d.id !== id));
};


  // Handle Add/Edit Department
const handleSaveDepartment = async () => {
  const data = editingDepartment || newDepartment;

  if (!data.name) return;

  if (editingDepartment) {
    // UPDATE
    const updated = await updateDepartment(editingDepartment.id, {
      name: data.name
    });

    setDepartments(
      departments.map(d =>
        d.id === updated.id
          ? { id: updated.id, name: updated.department }
          : d
      )
    );
  } else {
    // ADD
    const created = await addDepartment({ name: data.name });

    setDepartments([
      ...departments,
      { id: created.id, name: created.department }
    ]);
  }

  setNewDepartment({ name: "" });
  setEditingDepartment(null);
  setIsDepartmentModalOpen(false);
};


const handleEditDepartment = (dept) => {
  setEditingDepartment({
    id: dept.id,
    name: dept.name
  });
  setIsDepartmentModalOpen(true);
};


  // Handle Delete Department
const handleDeleteDepartment = async (id) => {
  if (!window.confirm("Delete this Department?")) return;

  await removeDepartment(id);

  setDepartments(departments.filter(d => d.id !== id));
};


  // Modal Component


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage users, doers, and departments</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <User size={20} />
                Users
              </button>
              <button
                onClick={() => setActiveTab("doers")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "doers"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users size={20} />
                Doers
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "departments"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Building2 size={20} />
                Departments
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setNewUser({ username: "", password: "", role: "user", pageAccess: [] });
                      setIsUserModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page Access
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {"•".repeat(user.password.length)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin" 
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {/* {user.pageAccess.join(", ") || "None"} */}
                            {Array.isArray(user.pageAccess) ? user.pageAccess.join(", ") : "None"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
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
              </div>
            )}

            {/* Doers Tab */}
            {activeTab === "doers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Doer Management</h2>
                  <button
                    onClick={() => {
                      setEditingDoer(null);
                      setNewDoer({ name: "", department: "" });
                      setIsDoerModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Doer
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {doers.map((doer) => (
                        <tr key={doer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doer.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEditDoer(doer)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoer(doer.id)}
                                className="text-red-600 hover:text-red-900"
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
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === "departments" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Department Management</h2>
                  <button
                    onClick={() => {
                      setEditingDepartment(null);
                      setNewDepartment({ name: "" });
                      setIsDepartmentModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Department
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dept.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEditDepartment(dept)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(dept.id)}
                                className="text-red-600 hover:text-red-900"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Edit User" : "Add New User"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={editingUser ? editingUser.username : newUser.username}
              onChange={(e) => editingUser 
                ? setEditingUser({ ...editingUser, username: e.target.value })
                : setNewUser({ ...newUser, username: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={editingUser ? editingUser.password : newUser.password}
              onChange={(e) => editingUser
                ? setEditingUser({ ...editingUser, password: e.target.value })
                : setNewUser({ ...newUser, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={editingUser ? editingUser.role : newUser.role}
              onChange={(e) => editingUser
                ? setEditingUser({ ...editingUser, role: e.target.value })
                : setNewUser({ ...newUser, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Access
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {pageOptions.map((page) => (
                <label key={page} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editingUser ? editingUser.pageAccess : newUser.pageAccess).includes(page)}
                    onChange={() => handlePageAccessToggle(page)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{page}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsUserModalOpen(false);
                setEditingUser(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingUser ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Doer Modal */}
      <Modal
        isOpen={isDoerModalOpen}
        onClose={() => {
          setIsDoerModalOpen(false);
          setEditingDoer(null);
        }}
        title={editingDoer ? "Edit Doer" : "Add New Doer"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doer Name
            </label>
            <input
              type="text"
              value={editingDoer ? editingDoer.name : newDoer.name}
              onChange={(e) => editingDoer
                ? setEditingDoer({ ...editingDoer, name: e.target.value })
                : setNewDoer({ ...newDoer, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={editingDoer ? editingDoer.department : newDoer.department}
              onChange={(e) => editingDoer
                ? setEditingDoer({ ...editingDoer, department: e.target.value })
                : setNewDoer({ ...newDoer, department: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsDoerModalOpen(false);
                setEditingDoer(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDoer}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingDoer ? "Update Doer" : "Add Doer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Department Modal */}
      <Modal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        title={editingDepartment ? "Edit Department" : "Add New Department"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={editingDepartment ? editingDepartment.name : newDepartment.name}
              onChange={(e) => editingDepartment
                ? setEditingDepartment({ ...editingDepartment, name: e.target.value })
                : setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsDepartmentModalOpen(false);
                setEditingDepartment(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDepartment}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingDepartment ? "Update Department" : "Add Department"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;