import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
    mobile_number: '',
    institution_code: '',
  });
  const [institutionId, setInstitutionId] = useState<number | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [institutionError, setInstitutionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitution = async () => {
      if (formData.institution_code.trim() === '') {
        setInstitutionId(null);
        setInstitutionName(null);
        setInstitutionError(null);
        return;
      }
      
      if (formData.institution_code.length > 2) { // Fetch only when code is reasonably long
        setInstitutionError(null);
        setInstitutionName(null);
        setInstitutionId(null);
        try {
          const response = await fetch(`/api/users/institutions/${formData.institution_code}/`);
          if (response.ok) {
            const data = await response.json();
            setInstitutionId(data.id);
            setInstitutionName(data.name);
          } else {
            setInstitutionError('Institution not found.');
          }
        } catch (err) {
          setInstitutionError('Failed to verify institution.');
        }
      }
    };

    const debounce = setTimeout(fetchInstitution, 500); // Debounce API calls
    return () => clearTimeout(debounce);
  }, [formData.institution_code]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (formData.institution_code.trim() !== '' && !institutionId) {
        setError('Please provide a valid institution code or leave it blank.');
        setLoading(false);
        return;
    }

    try {
      const registrationData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        role: formData.role,
        mobile_number: formData.mobile_number,
      };

      if (institutionId) {
        registrationData.institution = institutionId;
      }


      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        // Registration successful, redirect to login
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password2}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              I am a...
            </label>
            <select
              id="role"
              name="role"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              id="mobile_number"
              name="mobile_number"
              type="text"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.mobile_number}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="institution_code" className="block text-sm font-medium text-gray-700">
              Institution Code (Optional)
            </label>
            <input
              id="institution_code"
              name="institution_code"
              type="text"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.institution_code}
              onChange={handleChange}
            />
            {institutionName && <p className="mt-1 text-sm text-green-600">Found: {institutionName}</p>}
            {institutionError && <p className="mt-1 text-sm text-red-600">{institutionError}</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;