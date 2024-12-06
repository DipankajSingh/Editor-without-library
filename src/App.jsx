import './App.css'
import Nav from './components/Nav'
import Playground from './playground/Playground'

function App() {
  console.log("App");
  return (
    <div  className='w-full h-full flex flex-col overflow-hidden'>
      <Nav />
      <Playground />
    </div>
  )
}

export default App
