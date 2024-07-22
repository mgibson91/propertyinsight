'use client';

import { Button, Card, Heading, IconButton, Popover, Select, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { v4 as uuid } from 'uuid';
import { Brand } from '@/utils/brand';
import { AddConditionPopover } from '@/components/triggers/add-condition-popover';
import { OutcomeConfig, OutcomeId } from '@/logic/outcomes/types';
import { Condition, ConditionField } from '@/logic/conditions/types';

export const DEFAULT_OPERATORS: { label: string; func: string }[] = [
  {
    label: 'crossover',
    func: `(a,b) => {
return a[0] > b[0] && ((a[1] < b[1]) || (a[1] === b[1] && a[2] < b[2]))
}`,
  },
];

const DEFAULT_CONDITION: Condition = {
  fieldA: {
    property: 'close',
    offset: 0,
  },
  operator: DEFAULT_OPERATORS[0].label,
  fieldB: {
    property: 'close',
    offset: 0,
  },
};

export const EditOutcome = (props: {
  outcome?: OutcomeConfig;
  topRightSlot?: React.ReactNode;
  properties: {
    default: string[];
    indicator: { indicatorTag: string; streamTag: string[] }[];
  };
  operators: { label: string; func: string }[];
  saveOutcome: (outcome: OutcomeConfig) => void;
}) => {
  const { outcome, properties, topRightSlot, operators, saveOutcome } = props;
  const [name, setName] = useState(outcome?.name || '');
  // const [conditions, setConditions] = useState<OutcomeCondition[]>(outcome?.conditions || []);
  const [successConditions, setSuccessConditions] = useState<Condition[]>(outcome?.successConditions || []);
  const [failureConditions, setFailureConditions] = useState<Condition[]>(outcome?.failureConditions || []);
  const [pendingCondition, setPendingCondition] = useState<Condition>(DEFAULT_CONDITION);

  useEffect(() => {
    setName(outcome?.name || '');
    // setConditions(outcome?.conditions || []);
    setSuccessConditions(outcome?.successConditions || []);
    setFailureConditions(outcome?.failureConditions || []);
  }, [outcome]);

  const addCondition = (setConditionsFunction: React.Dispatch<React.SetStateAction<Condition[]>>) => {
    setConditionsFunction(prevConditions => [...prevConditions, pendingCondition]);
    setPendingCondition(DEFAULT_CONDITION);
  };

  const renderConditions = (
    conditions: Condition[],
    setConditionsFunction: React.Dispatch<React.SetStateAction<Condition[]>>
  ) => (
    <Card className={''}>
      <div className={'flex flex-col max-h-[200px] overflow-hidden'}>
        {conditions.length > 0 ? (
          <div className={'flex flex-col gap-1 overflow-auto'}>
            {conditions.map((condition, index) => (
              <div key={index} className={'flex flex-row gap-2 items-center justify-between py-2'}>
                <p>{getConditionString(condition)}</p>
                <div className={'flex flex-row items-center gap-3'}>
                  <IconButton
                    color={'tomato'}
                    variant={'ghost'}
                    className="!m-0"
                    size={'1'}
                    onClick={() => {
                      conditions.splice(index, 1);
                      setConditionsFunction([...conditions]);
                    }}
                  >
                    <TrashIcon></TrashIcon>
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={'flex items-center justify-center h-full'}>
            <p>No conditions specified</p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={'flex flex-col gap-3'}>
      <div className={'flex flex-row justify-between gap-2 items-center'}>
        <Heading>{outcome?.name ? 'Edit Outcome' : 'Create Outcome'}</Heading>
        {topRightSlot}
      </div>

      <div className={'flex flex-col'}>
        <Heading size={'4'}>Name</Heading>
        <TextField.Root value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className={'flex flex-col gap-3'}>
        {/*<div className={'flex flex-col gap-2'}>*/}
        {/*  <div className={'flex flex-row justify-between items-center'}>*/}
        {/*    <Heading size={'4'}>Conditions</Heading>*/}
        {/*    <AddConditionPopover*/}
        {/*      properties={properties}*/}
        {/*      operators={operators}*/}
        {/*      pendingCondition={pendingCondition}*/}
        {/*      setPendingCondition={setPendingCondition}*/}
        {/*      addCondition={() => addCondition(setConditions)}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*  {renderConditions(conditions, setConditions)}*/}
        {/*</div>*/}

        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'4'}>Success Conditions</Heading>
            <AddConditionPopover
              properties={properties}
              operators={operators}
              pendingCondition={pendingCondition}
              setPendingCondition={setPendingCondition}
              addCondition={() => addCondition(setSuccessConditions)}
            />
          </div>
          {renderConditions(successConditions, setSuccessConditions)}
        </div>

        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'4'}>Failure Conditions</Heading>
            <AddConditionPopover
              properties={properties}
              operators={operators}
              pendingCondition={pendingCondition}
              setPendingCondition={setPendingCondition}
              addCondition={() => addCondition(setFailureConditions)}
            />
          </div>
          {renderConditions(failureConditions, setFailureConditions)}
        </div>

        <Button
          disabled={(successConditions.length === 0 && failureConditions.length === 0) || !name}
          onClick={() => {
            saveOutcome({
              id: outcome?.id || (uuid() as OutcomeId),
              name,
              // conditions,
              successConditions,
              failureConditions,
              enabled: outcome?.enabled == null ? true : outcome.enabled,
            });
          }}
        >
          Save Outcome
        </Button>
      </div>
    </div>
  );
};

function getConditionString(condition: Condition) {
  const getFieldString = (field: ConditionField) => {
    if (field.property === 'value') {
      return field.property;
    } else {
      return `${field.property}[${field.offset}]`;
    }
  };

  return `${getFieldString(condition.fieldA)} ${condition.operator} ${getFieldString(condition.fieldB)}`;
}
