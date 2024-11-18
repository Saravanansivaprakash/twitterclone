import{Navigate, Route, Routes} from 'react-router-dom'
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import HomePage from './pages/home/HomePage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import  { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from './constant/url';
import NotificationPage from './pages/notification/NotificationPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProfilePage from './pages/profile/ProfilePage';



const App = () =>  {
  const {data: authUser, isLoading} = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
					method: "GET",
					credentials: 'include',
					headers: {
						"Content-Type": "application/json",
						"Accept" : "application/json"
					}
				});
        
        const data =  await res.json();
        if (data.error) return null

        if (!res.ok){
          throw new Error(data.error || "Something Went Wrong")
        }
        return data;
        
      } catch (error) {
        throw error
        
      }
    },
    retry: false
  })

  if(isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner />
      </div>
    )
  }
  
   return (
      
        <div className='app flex max-w-6xl mx-auto'>
          {authUser && <Sidebar/>}
          <Routes>
            <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login" />} />
            <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to="/" />} />
            <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />}/>
            <Route path="/notifications" element={ authUser ? <NotificationPage />: <Navigate to="/login" />} />
            <Route path="/profile/:username" element={authUser ? <ProfilePage/> : <Navigate to="/login" />} />
          </Routes>
          {authUser && <RightPanel/>}
          <Toaster />
        </div>
    )
}


export default App;
