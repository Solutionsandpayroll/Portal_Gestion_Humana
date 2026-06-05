import React, { useState, useRef, useEffect } from 'react';
import './PersonSelector.css';

const PEOPLE = [
  "Eduard Forero","Alejandro Echavarria","Alfonso Fonseca","Yenny Delgado","Tatiana Cumbe","Viviana Guzman","Rocio Guacaneme","Giovanna Guio","Alba Luz Borja","German Hincapie","Deissy Preciado","Kevin Gonzalez","Lina Chinome","Fabian Morales","Marco Castiblanco","Yadira Pineda","Patricia Osorio","Ricardo Arambulo Polo","Patricia Jimenez","Jennifer Cervantes","Yina Vega","William Romero","Michael Pertuz","Julieth Bonilla","Alba Suarez","Nathalie Vaquiro","Yuly Peña","Daniela Sandoval","Lorena Garcia Navarro","Tatiana Chavarro","Viviana Martinez","Paola Velasquez","Dayan Manjarres","Carolina Morales","Brayan Pardo","Camila Herrera","Paola Gonzalez","Ana Maria Gutierrez","Ingrid Pineda","Erika Letrado","Jhon Jairo Leon","Yeferson Pineda","Nicolas Ballesteros","Sandra Bello","Sharon Amaya","Lina Guio","Cristian Parada","Diana Mendez","Simon Tschannen","Eduardo Castañeda","Juan David Urbina","Dayana Mejia","Viviana Achury","Oscar Cano","Johana Arevalo","Michelle Sanchez","Heliana Ramirez","Lesly Madrid"
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export default function PersonSelector({ value, onChange, placeholder, required, id }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFilter(value ?? '');
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const options = PEOPLE.filter((p) => p.toLowerCase().includes(filter.toLowerCase()));

  function pick(v: string) {
    onChange(v);
    setFilter(v);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(0, options.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && options.length > 0) {
        e.preventDefault();
        pick(options[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="person-select" ref={containerRef}>
      <input
        id={id}
        ref={inputRef}
        className="person-input"
        type="text"
        placeholder={placeholder}
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        aria-autocomplete="list"
        aria-expanded={open}
        required={required}
      />

      {open && (
        <div className="person-dropdown" role="listbox">
          {options.length === 0 ? (
            <div className="person-empty">No hay coincidencias</div>
          ) : (
            <ul>
              {options.map((p, i) => (
                <li
                  key={p}
                  className={`person-option${i === highlight ? ' highlighted' : ''}`}
                  onMouseDown={(ev) => { ev.preventDefault(); pick(p); }}
                  onMouseEnter={() => setHighlight(i)}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
