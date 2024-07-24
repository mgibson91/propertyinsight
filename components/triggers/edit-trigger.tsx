'use client';

import { Button, Card, Heading, IconButton, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { TrashIcon } from '@radix-ui/react-icons';
import { v4 as uuid } from 'uuid';
import { Brand } from '@/utils/brand';
import { AddConditionPopover } from '@/components/triggers/add-condition-popover';
import { DefaultOperatorType } from '@/logic/indicators/types';

interface TriggerField {
  property: string;
  offset: number;
}

export type TransformOperator = '+' | '-';
export type TransformType = 'percent' | 'absolute';

export interface FieldTransform {
  operator: TransformOperator;
  value: number;
  type: TransformType;
}

export interface TriggerCondition {
  fieldA: TriggerField;
  operator: {
    custom?: boolean;
    type: DefaultOperatorType;
  };
  fieldB: TriggerField;
  fieldBTransform?: FieldTransform;
}

export type TriggerId = Brand<string, 'TriggerId'>;

export interface Trigger {
  id: TriggerId;
  name: string;
  enabled: boolean;
  conditions: TriggerCondition[];
}

export const DEFAULT_OPERATORS: { label: DefaultOperatorType; func: string }[] = [
  {
    label: 'crossover',
    func: `(a,b) => {
return a[0] > b[0] && ((a[1] < b[1]) || (a[1] === b[1] && a[2] < b[2]))
}`,
  },
  {
    label: 'crossunder',
    func: `(a,b) => {
return a[0] < b[0] && ((a[1] > b[1]) || (a[1] === b[1] && a[2] > b[2]))
}`,
  },
  {
    label: '>',
    func: `(a,b) => {
return a[0] > b[0]
}`,
  },
  {
    label: '<',
    func: `(a,b) => {
return a[0] < b[0]
}`,
  },
  {
    label: '>=',
    func: `(a,b) => {
return a[0] >= b[0]
}`,
  },
  {
    label: '<=',
    func: `(a,b) => {
return a[0] <= b[0]
}`,
  },
  {
    label: '==',
    func: `(a,b) => {
return a[0] === b[0]
}`,
  },
];

export const EditTrigger = (props: {
  trigger?: Trigger;
  topRightSlot?: React.ReactNode;
  properties: {
    default: string[];
    indicator: { indicatorTag: string; streamTag: string[] }[];
  };
  operators: { label: string; func: string }[];
  saveTrigger: (trigger: Trigger) => void;
}) => {
  const { trigger, properties, topRightSlot, operators, saveTrigger } = props;
  const [name, setName] = useState(trigger?.name || '');
  const [conditions, setConditions] = useState<TriggerCondition[]>(trigger?.conditions || []);

  useEffect(() => {
    setName(trigger?.name || '');
    setConditions(trigger?.conditions || []);
  }, [trigger]);

  const addCondition = (condition: TriggerCondition) => {
    setConditions([...conditions, condition]);
  };

  return (
    <div className={'flex flex-col gap-3'}>
      <div className={'flex flex-row justify-between gap-2 items-center'}>
        <Heading>{trigger?.name ? 'Edit Entry' : 'Create Entry'}</Heading>
        {topRightSlot}
      </div>

      <div className={'flex flex-col'}>
        <Heading size={'4'}>Name</Heading>
        <TextField.Root value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className={'flex flex-col gap-3'}>
        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'4'}>Conditions</Heading>
            <AddConditionPopover properties={properties} operators={operators} addCondition={addCondition} />
          </div>
          <Card className={''}>
            <div className={'flex flex-col max-h-[200px] overflow-hidden'}>
              {conditions.length > 0 ? (
                <div className={'flex flex-col gap-1 overflow-auto'}>
                  {conditions.map((condition, index) => {
                    return (
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
                              setConditions([...conditions]);
                            }}
                          >
                            <TrashIcon></TrashIcon>
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={'flex items-center justify-center h-full'}>
                  <p>No conditions specified</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Button
          disabled={conditions.length === 0 || !name}
          onClick={() => {
            saveTrigger({
              id: trigger?.id || (uuid() as TriggerId),
              name,
              conditions,
              enabled: trigger?.enabled == null ? true : trigger.enabled,
            });
          }}
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
};

function getConditionString(condition: TriggerCondition) {
  const getFieldString = (field: TriggerField) => {
    if (field.property === 'value') {
      return field.property;
    } else {
      return `${field.property}[${field.offset}]`;
    }
  };

  return `${getFieldString(condition.fieldA)} ${condition.operator.type} ${getFieldString(condition.fieldB)}`;
}
