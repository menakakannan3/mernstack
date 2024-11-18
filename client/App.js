import React, { useState } from 'react';
import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, Background } from 'react-flow-renderer';
import axios from 'axios';
import './App.css';

const initialElements = [
  { id: '1', type: 'input', data: { label: 'Lead Source' }, position: { x: 250, y: 0 } },
];

function App() {
  const [elements, setElements] = useState(initialElements);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const onElementsRemove = (elementsToRemove) => {
    const removedNodes = elementsToRemove.filter((el) => el.type === 'node');
    const removedEdges = elementsToRemove.filter((el) => el.type === 'edge');

    setElements((prevElements) => {
      const updatedNodes = applyNodeChanges(
        removedNodes.map((node) => ({ id: node.id, type: 'remove' })),
        prevElements.filter((el) => el.type === 'node')
      );
      const updatedEdges = applyEdgeChanges(
        removedEdges.map((edge) => ({ id: edge.id, type: 'remove' })),
        prevElements.filter((el) => el.type === 'edge')
      );
      return [...updatedNodes, ...updatedEdges];
    });
  };

  const onLoad = (rfi) => setReactFlowInstance(rfi);

  const saveFlow = async () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    try {
      await axios.post('http://localhost:5000/save-flow', { flow });
      alert('Flow saved successfully!');
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  const addNode = (type) => {
    const id = `${elements.length + 1}`;
    const newNode = {
      id,
      type: 'default',
      data: { label: type },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setElements((els) => els.concat(newNode));
  };

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ position: 'absolute', zIndex: 10, padding: 10 }}>
        <button onClick={() => addNode('Cold Email')}>Add Cold Email Node</button>
        <button onClick={() => addNode('Wait/Delay')}>Add Wait/Delay Node</button>
        <button onClick={saveFlow}>Save Flow</button>
      </div>
      <ReactFlow
        elements={elements}
        onConnect={onConnect}
        onElementsRemove={onElementsRemove}
        onLoad={onLoad}
        style={{ width: '100%', height: '100%' }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default App;
