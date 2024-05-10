import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      this is home page
      <Button onClick={() => {
        navigate('/login');
      }}> 
        click to go to login
      </Button>
    </>
  );
};

export default HomePage;
