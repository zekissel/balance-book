import { useState } from 'react';

export default function News() {

  const [path, setPath] = useState('');

  return (
    <div className='news-main'>
      <p>news (work in progress)</p>

      <input type="file" onChange={(e) => setPath(e.target.value)} />
      

      { path }
    </div>
  )
}