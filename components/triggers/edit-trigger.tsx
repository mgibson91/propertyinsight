'use client';

import { Button, Card, Heading, IconButton, Popover, Select, TextFieldInput, TextFieldSlot } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ArrowDownIcon, Cross1Icon, Pencil1Icon, Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { v4 as uuid } from 'uuid';

// const DEFAULT_OPERATORS = [
//   {
//     label: '=',
//     func: '(a,b) => a === b',
//   },
//   // {
//   //   label: 'Does not equal',
//   //   name: 'notEqual',
//   //   operator: '!=',
//   // },
//   {
//     label: '>',
//     func: '(a,b) => a > b',
//   },
//   {
//     label: '<',
//     func: '(a,b) => a > b',
//   },
//   {
//     label: '>=',
//     func: '(a,b) => a >= b',
//   },
//   {
//     label: '<=',
//     func: '(a,b) => a <= b',
//   },
// ];

interface TriggerField {
  property: string;
  offset: number;
}

interface TriggerCondition {
  fieldA: TriggerField;
  operator: string;
  fieldB: TriggerField;
}

export interface Trigger {
  id: string;
  name: string;
  enabled: boolean;
  conditions: TriggerCondition[];
}

export const DEFAULT_OPERATORS: { label: string; func: string }[] = [
  {
    label: 'crossover',
    func: `(a,b) => {
return a[0] > b[0] && ((a[1] < b[1]) || (a[1] === b[1] && a[2] < b[2]))
}`,
  },
];

const DEFAULT_CONDITION: TriggerCondition = {
  fieldA: {
    property: 'close',
    offset: 0,
  },
  operator: DEFAULT_OPERATORS[0].label,
  fieldB: {
    property: 'close',
    offset: 1,
  },
};

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
  const [pendingTopLevelA, setPendingTopLevelA] = useState<string>('close'); // For indicator tags
  const [pendingSubLevelA, setPendingSubLevelA] = useState<string>(); // For indicator tags
  const [pendingTopLevelB, setPendingTopLevelB] = useState<string>('close'); // For indicator tags in Field B
  const [pendingSubLevelB, setPendingSubLevelB] = useState<string>(); // For indicator tags in Field B
  const [pendingCondition, setPendingCondition] = useState<TriggerCondition>(DEFAULT_CONDITION);

  useEffect(() => {
    setName(trigger?.name || '');
    setConditions(trigger?.conditions || []);
  }, [trigger]);

  useEffect(() => {
    if (!pendingTopLevelA) {
      return;
    }

    if (pendingTopLevelA === 'value') {
      setPendingCondition({
        ...pendingCondition,
        fieldA: {
          ...pendingCondition.fieldA,
          property: 'value',
        },
      });
    } else if (properties.default.includes(pendingTopLevelA)) {
      setPendingCondition({
        ...pendingCondition,
        fieldA: {
          ...pendingCondition.fieldA,
          property: pendingTopLevelA,
        },
      });
    } else {
      // It's an indicatorTag : streamTag combo. In reality, all data is ${indicatorTag}_${streamTag}
      setPendingCondition({
        ...pendingCondition,
        fieldA: {
          ...pendingCondition.fieldA,
          property: `${pendingTopLevelA}_${pendingSubLevelA}`,
        },
      });
    }
  }, [pendingTopLevelA, pendingSubLevelA]);

  useEffect(() => {
    if (!pendingTopLevelB) {
      return;
    }

    if (pendingTopLevelB === 'value') {
      setPendingCondition({
        ...pendingCondition,
        fieldB: {
          ...pendingCondition.fieldB,
          property: 'value',
        },
      });
    } else if (properties.default.includes(pendingTopLevelB)) {
      setPendingCondition({
        ...pendingCondition,
        fieldB: {
          ...pendingCondition.fieldB,
          property: pendingTopLevelB,
        },
      });
    } else {
      // It's an indicatorTag : streamTag combo. In reality, all data is ${indicatorTag}_${streamTag}
      setPendingCondition({
        ...pendingCondition,
        fieldB: {
          ...pendingCondition.fieldB,
          property: `${pendingTopLevelB}_${pendingSubLevelB}`,
        },
      });
    }
  }, [pendingTopLevelB, pendingSubLevelB]);

  const indicatorTags = properties.indicator.map(i => i.indicatorTag);

  return (
    <div className={'flex flex-col gap-3'}>
      <div className={'flex flex-row justify-between gap-2 items-center'}>
        <Heading>{trigger?.name ? 'Edit Trigger' : 'Create Trigger'}</Heading>
        {topRightSlot}
      </div>

      <div className={'flex flex-col'}>
        <Heading size={'4'}>Name</Heading>
        <TextFieldInput value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className={'flex flex-col gap-3'}>
        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'4'}>Conditions</Heading>
            <Popover.Root>
              <Popover.Trigger>
                <IconButton color={'grass'} variant={'soft'}>
                  <PlusIcon></PlusIcon>
                </IconButton>
              </Popover.Trigger>

              <Popover.Content>
                <div className={'flex flex-col w-[400px]'}>
                  <Heading size={'4'}>Add Condition</Heading>

                  <div className="my-2">
                    <div className={'flex flex-col gap-2'}>
                      <div className={'w-full flex gap-2'}>
                        <div className={'flex flex-row flex-1 gap-2'}>
                          <div className={'flex flex-col flex-1'}>
                            <Heading size={'3'}>Field A</Heading>
                            <Select.Root
                              value={pendingTopLevelA}
                              onValueChange={value => {
                                setPendingTopLevelA(value);
                              }}
                            >
                              <Select.Trigger className={'flex-1'} />
                              <Select.Content>
                                <Select.Group>
                                  <Select.Label>Default</Select.Label>
                                  {properties.default.map(field => (
                                    <Select.Item key={field} value={field}>
                                      {field}
                                    </Select.Item>
                                  ))}
                                </Select.Group>

                                <Select.Group>
                                  <Select.Label>Indicators</Select.Label>
                                  {properties.indicator.map(indicator => (
                                    <Select.Item key={indicator.indicatorTag} value={indicator.indicatorTag}>
                                      {indicator.indicatorTag}
                                    </Select.Item>
                                  ))}
                                </Select.Group>
                              </Select.Content>
                            </Select.Root>
                          </div>

                          {pendingTopLevelA && indicatorTags.includes(pendingTopLevelA) && (
                            <div className={'flex flex-col flex-1'}>
                              <Heading size={'3'}>Property</Heading>
                              <Select.Root
                                value={pendingSubLevelA}
                                onValueChange={value => {
                                  setPendingSubLevelA(value);
                                }}
                              >
                                <Select.Trigger className={'flex-1'} />
                                <Select.Content>
                                  {properties.indicator
                                    .find(i => i.indicatorTag === pendingTopLevelA)
                                    ?.streamTag.map(tag => (
                                      <Select.Item key={tag} value={tag}>
                                        {tag}
                                      </Select.Item>
                                    ))}
                                </Select.Content>
                              </Select.Root>
                            </div>
                          )}
                        </div>

                        <div className={'flex flex-col flex-grow-0 !w-[50px]'}>
                          <Heading size={'3'}>Offset</Heading>
                          <TextFieldInput
                            className="flex-grow-0 !w-[50px]"
                            type="number"
                            value={pendingCondition.fieldA.offset}
                            onChange={e => {
                              setPendingCondition({
                                ...pendingCondition,
                                fieldA: {
                                  ...pendingCondition.fieldA,
                                  offset: parseInt(e.target.value),
                                },
                              });
                            }}
                          ></TextFieldInput>
                        </div>
                      </div>

                      <Heading size={'3'}>Operator</Heading>
                      <Select.Root
                        value={pendingCondition.operator}
                        onValueChange={value => {
                          setPendingCondition({
                            ...pendingCondition,
                            operator: value,
                          });
                        }}
                      >
                        <Select.Trigger className={'w-full'} />
                        <Select.Content>
                          {operators.map(op => (
                            <Select.Item key={op.label} value={op.label}>
                              {op.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>

                      <div className={'w-full flex gap-2'}>
                        <div className={'flex flex-col flex-1 '}>
                          <Heading size={'3'}>Field B</Heading>
                          <div className={'flex flex-row flex-1 gap-2'}>
                            <div className={'flex flex-col flex-1'}>
                              <Select.Root
                                value={pendingTopLevelB}
                                onValueChange={value => {
                                  setPendingTopLevelB(value);
                                }}
                              >
                                <Select.Trigger className={'flex-1'} />
                                <Select.Content>
                                  <Select.Group>
                                    <Select.Label>Fixed</Select.Label>
                                    <Select.Item key={`value`} value={'value'}>
                                      Value
                                    </Select.Item>
                                  </Select.Group>

                                  <Select.Group>
                                    <Select.Label>Default</Select.Label>
                                    {properties.default.map(field => (
                                      <Select.Item key={field} value={field}>
                                        {field}
                                      </Select.Item>
                                    ))}
                                  </Select.Group>

                                  <Select.Group>
                                    <Select.Label>Indicators</Select.Label>
                                    {properties.indicator.map(indicator => (
                                      <Select.Item key={indicator.indicatorTag} value={indicator.indicatorTag}>
                                        {indicator.indicatorTag}
                                      </Select.Item>
                                    ))}
                                  </Select.Group>
                                </Select.Content>
                              </Select.Root>
                            </div>

                            {pendingTopLevelB && indicatorTags.includes(pendingTopLevelB) && (
                              <Select.Root
                                value={pendingSubLevelB}
                                onValueChange={value => {
                                  setPendingSubLevelB(value);
                                }}
                              >
                                <Select.Trigger className={'flex-1'} />
                                <Select.Content>
                                  {properties.indicator
                                    .find(i => i.indicatorTag === pendingTopLevelB)
                                    ?.streamTag.map(tag => (
                                      <Select.Item key={tag} value={tag}>
                                        {tag}
                                      </Select.Item>
                                    ))}
                                </Select.Content>
                              </Select.Root>
                            )}
                          </div>
                        </div>

                        <div className={'flex flex-col'}>
                          <Heading size={'3'}>Offset</Heading>
                          <TextFieldInput
                            className="flex-grow-0 !w-[50px]"
                            type="number"
                            value={pendingCondition.fieldB.offset}
                            onChange={e => {
                              setPendingCondition({
                                ...pendingCondition,
                                fieldB: {
                                  ...pendingCondition.fieldB,
                                  offset: parseInt(e.target.value),
                                },
                              });
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        className="!mt-3"
                        variant={'soft'}
                        onClick={() => {
                          const newConditions = [...conditions, pendingCondition];
                          // conditions.push(pendingCondition);
                          setConditions(newConditions);
                          setPendingCondition(DEFAULT_CONDITION);
                        }}
                      >
                        Add Condition
                      </Button>
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
          <Card className={''}>
            <div className={'flex flex-col max-h-[200px] overflow-hidden'}>
              {conditions.length > 0 ? (
                <div className={'flex flex-col gap-1 overflow-auto'}>
                  {conditions.map((condition, index) => {
                    return (
                      <div className={'flex flex-row gap-2 items-center justify-between py-2'}>
                        <p>{getConditionString(condition)}</p>

                        <div className={'flex flex-row items-center gap-3'}>
                          {/*<IconButton*/}
                          {/*  variant={'ghost'}*/}
                          {/*  size={'1'}*/}
                          {/*  onClick={() => {*/}
                          {/*    // Set the pending condition to the one being edited*/}
                          {/*    setPendingCondition(condition);*/}
                          {/*  }}*/}
                          {/*>*/}
                          {/*  <Pencil1Icon></Pencil1Icon>*/}
                          {/*</IconButton>*/}
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
              id: trigger?.id || uuid(),
              name,
              conditions,
              enabled: trigger?.enabled == null ? true : trigger.enabled,
            });
          }}
        >
          Save Trigger
        </Button>
      </div>
    </div>
  );
};

function getConditionString(condition: TriggerCondition) {
  // Do this by A and B separately. If field, then also include offset as [<offset>]
  const getFieldString = (field: TriggerField) => {
    if (field.property === 'value') {
      return field.property;
    } else {
      return `${field.property}[${field.offset}]`;
    }
  };

  return `${getFieldString(condition.fieldA)} ${condition.operator} ${getFieldString(condition.fieldB)}`;
}
