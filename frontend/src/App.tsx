// import { useState } from "react";
// import Navbar from "./components/Navbar";
// function App() {
//   const [path, setPath] = useState("");
//   const [network, setNetwork] = useState("sepolia");
//   const [output, setOutput] = useState("");

//   const validate = () => {
//     if (!path) {
//       setOutput("Please enter a file path");
//       return;
//     }

//     setOutput(
//       `Running validator with:
// path = ${path}
// network = ${network}

// (todo backend integration)`
//     );
//   };

//   return (
    
//     <>
//     <Navbar />  
//       <h1>Validator UI</h1>
      
//       <input
//         placeholder="../testFile.txt"
//         value={path}
//         onChange={(e) => setPath(e.target.value)}
//       />

//       <select value={network} onChange={(e) => setNetwork(e.target.value)}>
//         <option value="sepolia">sepolia</option>
//         <option value="localhost">localhost</option>
//         <option value="mainnet">mainnet</option>
//       </select>

//       <button onClick={validate}>Validate</button>

//       <pre>{output}</pre>
//     </>
//   );
// }

// export default App;

