
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Users, Eye } from 'lucide-react';

interface IncidentPeopleSectionProps {
  peopleInvolved: string[];
  setPeopleInvolved: (people: string[]) => void;
  witnesses: string[];
  setWitnesses: (witnesses: string[]) => void;
}

const IncidentPeopleSection: React.FC<IncidentPeopleSectionProps> = ({
  peopleInvolved,
  setPeopleInvolved,
  witnesses,
  setWitnesses,
}) => {
  const addPerson = () => {
    setPeopleInvolved([...peopleInvolved, '']);
  };

  const removePerson = (index: number) => {
    setPeopleInvolved(peopleInvolved.filter((_, i) => i !== index));
  };

  const updatePerson = (index: number, value: string) => {
    const updated = [...peopleInvolved];
    updated[index] = value;
    setPeopleInvolved(updated);
  };

  const addWitness = () => {
    setWitnesses([...witnesses, '']);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index: number, value: string) => {
    const updated = [...witnesses];
    updated[index] = value;
    setWitnesses(updated);
  };

  return (
    <>
      <div className="space-y-4">
        <Label className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>People Involved</span>
        </Label>
        {peopleInvolved.map((person, index) => (
          <div key={index} className="flex space-x-2">
            <Input
              placeholder="Name of person involved"
              value={person}
              onChange={(e) => updatePerson(index, e.target.value)}
            />
            {peopleInvolved.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePerson(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addPerson}>
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Witnesses</span>
        </Label>
        {witnesses.map((witness, index) => (
          <div key={index} className="flex space-x-2">
            <Input
              placeholder="Name of witness"
              value={witness}
              onChange={(e) => updateWitness(index, e.target.value)}
            />
            {witnesses.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeWitness(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addWitness}>
          <Plus className="w-4 h-4 mr-2" />
          Add Witness
        </Button>
      </div>
    </>
  );
};

export default IncidentPeopleSection;
