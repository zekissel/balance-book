import { useMemo, useState } from "react";
import { ExpenseLeaf, IncomeLeaf, Account } from "../../typedef";
import '../../styles/Select.css';

type CategoryBase = typeof ExpenseLeaf | typeof IncomeLeaf | Account[];
function isAccount(tbd: CategoryBase): tbd is Account[] {
  return (tbd as Account[]).length !== undefined;
}
function determineCategory(tbd: CategoryBase): tbd is typeof ExpenseLeaf {
  if((tbd as typeof ExpenseLeaf).Home !== undefined){
    return true
  }
  return false
}

interface SelectProps { 
  value: string[];
  options: typeof ExpenseLeaf | typeof IncomeLeaf | Account[];
  onChange: (value: string[]) => void;
  multi: boolean;
  option2?: typeof ExpenseLeaf | typeof IncomeLeaf;
}
export default function TreeSelect({ value, options, onChange, multi, option2 }: SelectProps) {

  const [dropdown, setDropdown] = useState(false);

  const handleClick = (val: string) => {
    const replace = multi ? value.filter(v => !v.includes(val)) : [];
    const addValue = multi ? value.concat(val) : [val];

    if (value.includes(val)) onChange(replace);
    else onChange(addValue);
  }

  const acctTypes = useMemo(() => {
    if(isAccount(options)){
      return options.map((key) => key.account_type).filter((val, ind, arr) => arr.indexOf(val) === ind);
    }
    return []
  }, [options]);
  const rootSelected = (root: string) => {
    if (!isAccount(options)) return false;
    const selected = options.filter(o => value.includes(o.id));
    return selected.length > 0 && selected.map(a => `${a.account_type}`).includes(root);
  }
  const acctValues = useMemo(() => {
    if(isAccount(options)){
      return options.filter(a => value.includes(a.id)).map(a => `${a.account_type}:${a.account_name}`);
    }
    return []
  }, [options, value]);

  return (
    <div className='custom-select'>
      <input 
        type="text" 
        placeholder="Category"
        value={!isAccount(options) ? (value.includes('X') ? ['(Exclude)'] : []).concat(value.filter(v => v !== 'X')) : acctValues}
        onClick={() => setDropdown(!dropdown)}
        onBlur={() => setDropdown(false)}
        readOnly
      />

      { dropdown && 
        <ul className='dropdown'>
          { !isAccount(options) && Object.keys(options).map((key,index) => (
            <li key={index} className='dropdown-li' style={value.findIndex(c => c.includes(`${key}>`)) !== -1 ? selectedStyle : undefined}>{key}&gt;
              <div className='option-container'>
                { determineCategory(options) ? 
                  options[key as keyof typeof ExpenseLeaf].map(subOption => 
                    <div className='tree-option' key={subOption} style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined} onMouseDown={() => handleClick(`${key}>${subOption}`)}>{subOption}</div>
                  )
                :
                  options[key as keyof typeof IncomeLeaf].map(subOption => 
                    <div className='tree-option' key={subOption} style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined} onMouseDown={() => handleClick(`${key}>${subOption}`)}>{subOption}</div>
                )}
              </div>
            </li>
          ))}
          { option2 && Object.keys(option2).map((key,index) => (
            <li key={index} className='dropdown-li' style={value.findIndex(c => c.includes(`${key}>`)) !== -1 ? selectedStyle : undefined}>{key}&gt;
            <div className='option-container'>
              { determineCategory(option2) ? 
                option2[key as keyof typeof ExpenseLeaf].map(subOption => 
                  <div className='tree-option' key={subOption} style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined} onMouseDown={() => handleClick(`${key}>${subOption}`)}>{subOption}</div>
                )
              :
              option2[key as keyof typeof IncomeLeaf].map(subOption => 
                  <div className='tree-option' key={subOption} style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined} onMouseDown={() => handleClick(`${key}>${subOption}`)}>{subOption}</div>
              )}
            </div>
          </li>
          ))}
          { isAccount(options) && acctTypes.map((key,index) => (
            <li key={index} className='dropdown-li' style={rootSelected(`${key}`) ? selectedStyle : undefined}>{`${key}:`}
              <div className='option-container'>
                { options.filter(a => a.account_type === key).map((subOption) => 
                  <div className='tree-option' key={subOption.id} style={value.includes(`${subOption.id}`) ? selectedStyle : undefined} onMouseDown={() => handleClick(`${subOption.id}`)}>{`${subOption.account_name}`}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      }
    </div>
  )
}

const selectedStyle = { backgroundColor: '#91d2b3' };