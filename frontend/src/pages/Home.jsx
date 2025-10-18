import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ServicesMenu from '../components/ServicesMenu';
import ServiceDetail from '../components/ServiceDetail';
import BookingProcedure from '../components/BookingProcedure'
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      switch (user.role) {
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'nurse':
          navigate('/nurse-dashboard');
          break;
        case 'head_nurse':
          navigate('/head-nurse-dashboard');
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="">
      <HeroSection />
      <ServicesMenu/>
      <ServiceDetail/>
      <BookingProcedure/>
      <Footer/>
    </div>
  );
};

export default Home;