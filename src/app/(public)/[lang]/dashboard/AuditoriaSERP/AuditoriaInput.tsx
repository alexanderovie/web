import React, { useState } from "react";

interface AuditoriaInputProps {
  onSearch: (query: string, location: string) => void;
}

const AuditoriaInput = ({ onSearch }: AuditoriaInputProps) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch(query, location);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Nombre de negocio o palabra clave"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ciudad o Zipcode"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>
    </div>
  );
};

export default AuditoriaInput;
