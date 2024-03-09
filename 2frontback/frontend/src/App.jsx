import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    const fetchJokes = async () => {
      try {
        const response = await fetch('/api/jokes');
        if (!response.ok) {
          throw new Error('Failed to fetch jokes');
        }
        const data = await response.json();
        setJokes(data);
      } catch (error) {
        console.error('Error fetching jokes:', error);
      }
    };

    fetchJokes();
  }, []); // Empty dependency array to run effect only once on mount

  return (
    <div>
      <h1>Jokes</h1>
      <hr />
      <div>JOKES Number: {jokes.length}</div>
      <div>
        {jokes.map(joke => (
          <div key={joke.id}>
            <h2>{joke.title}</h2>
            <p>{joke.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
