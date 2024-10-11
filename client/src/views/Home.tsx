import AppLayout from "components/AppLayout";

const Content = () => {
  return <div>home</div>;
};

const Home = () => {
  return <AppLayout content={<Content />} />;
};

export default Home;
