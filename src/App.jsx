import './App.css'
import Nav from './components/Nav'
import Playground from './playground/Playground'

function App() {

  return (
    <div className='w-full h-full flex flex-col'>
      <Nav />
      <Playground />
    </div>
  )
}

export default App
