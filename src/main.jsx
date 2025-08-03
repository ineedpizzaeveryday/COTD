import { Buffer } from 'buffer'
window.Buffer = Buffer

import process from 'process'
window.process = process
import React, { useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './option.css';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import BAR_MENU from './bar_menu.jsx';
import data from './data.json';



function ShareableDivs() {
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShareableDivs />
  </StrictMode>
);
