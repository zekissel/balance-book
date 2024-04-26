import React, { useState } from "react";
import { Theme, SettingOptions } from "../../typedef";
import '../../styles/Settings.css';

interface SettingsProps {
  settings: SettingOptions,
  setSettings: React.Dispatch<React.SetStateAction<SettingOptions>>,
  restoreDefault: () => void,
}
export default function Settings ({ settings, setSettings, restoreDefault }: SettingsProps) {

  const [viewGeneral, setViewGeneral] = useState(true);

  return (
    <div className="page-root">
			<menu className="dynamic-menu">
        <div className="dynamic-menu-main">
          <button id={viewGeneral ? 'dynamic-menu-current' : ''} onClick={() => setViewGeneral(true)}>
            <img src="/general.svg" /> General
          </button>
          <button id={!viewGeneral ? 'dynamic-menu-current' : ''} onClick={() => setViewGeneral(false)}>
            <img src="/advanced.svg" /> Advanced
          </button>
        </div>
        <div className="dynamic-menu-main">
          <button onClick={restoreDefault}>
            <img src="/reset.svg" /> Restore Defaults
          </button>
        </div>
      </menu>

      <div className="page-main">
        { viewGeneral &&
          <ul className='settings-list'>
          <label htmlFor="theme">Theme:</label>
          <li id="theme">
            <button
              id={settings.theme === Theme.System ? "settings-theme-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.System })}
            >
              System
            </button>
            <button
              id={settings.theme === Theme.Light ? "settings-theme-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.Light })}
            >
              Light
            </button>
            <button
              id={settings.theme === Theme.Dark ? "settings-theme-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.Dark })}
            >
              Dark
            </button>
          </li>
        </ul>
        }

        { !viewGeneral &&
          <ul className='settings-list'>
            <li>(work in progress)</li>
          </ul>
        }
        
      </div>

    </div>
  );
}