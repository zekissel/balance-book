import { Theme, SettingOptions } from "../../typedef";

interface SettingsProps {
  settings: SettingOptions,
  setSettings: React.Dispatch<React.SetStateAction<SettingOptions>>
}
export default function Settings ({ settings, setSettings }: SettingsProps) {


  return (
    <div className="page-root">
			<menu className="dynamic-menu">
        <div className="dynamic-menu-main">
          <button>
            <img src="/list.svg" /> General
          </button>
          <button>
            <img src="/calendar.svg" /> Advanced
          </button>
        </div>
        <div className="dynamic-menu-main">
          <button>
            <img src="/list.svg" /> Restore Defaults
          </button>
        </div>
      </menu>

      <div className="page-main">
        
        <ul className='settings-list'>
          <label htmlFor="theme">Theme:</label>
          <li id="theme">
            <button
              id={settings.theme === Theme.System ? "settings-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.System })}
            >
              System
            </button>
            <button
              id={settings.theme === Theme.Light ? "settings-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.Light })}
            >
              Light
            </button>
            <button
              id={settings.theme === Theme.Dark ? "settings-active" : ""}
              onClick={() => setSettings({ ...settings, theme: Theme.Dark })}
            >
              Dark
            </button>
          </li>
        </ul>
      </div>

    </div>
  );
}