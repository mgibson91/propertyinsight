import { useEffect, useState } from 'react';
import { Button, Heading, IconButton, Popover, Select, TextFieldInput } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { TriggerCondition } from '@/components/triggers/edit-trigger';

export const AddConditionPopover = ({
  properties,
  operators,
  pendingCondition,
  setPendingCondition,
  addCondition,
}: {
  properties: {
    default: string[];
    indicator: { indicatorTag: string; streamTag: string[] }[];
  };
  operators: { label: string; func: string }[];
  pendingCondition: TriggerCondition;
  setPendingCondition: (condition: TriggerCondition) => void;
  addCondition: () => void;
}) => {
  const [pendingTopLevelA, setPendingTopLevelA] = useState<string>('close');
  const [pendingSubLevelA, setPendingSubLevelA] = useState<string>();
  const [pendingTopLevelB, setPendingTopLevelB] = useState<string>('close');
  const [pendingSubLevelB, setPendingSubLevelB] = useState<string>();
  const indicatorTags = properties.indicator.map(i => i.indicatorTag);

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
      setPendingCondition({
        ...pendingCondition,
        fieldA: {
          ...pendingCondition.fieldA,
          property: `${pendingTopLevelA}_${pendingSubLevelA}`,
        },
      });

      const indicator = properties.indicator.find(i => i.indicatorTag === pendingTopLevelA);

      if (!pendingSubLevelA) {
        const firstStream = indicator?.streamTag[0];
        if (firstStream) {
          setPendingSubLevelA(firstStream);
        }
      }
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
      setPendingCondition({
        ...pendingCondition,
        fieldB: {
          ...pendingCondition.fieldB,
          property: `${pendingTopLevelB}_${pendingSubLevelB}`,
        },
      });

      const indicator = properties.indicator.find(i => i.indicatorTag === pendingTopLevelB);
      if (!pendingSubLevelB) {
        const firstStream = indicator?.streamTag[0];
        if (firstStream) {
          setPendingSubLevelB(firstStream);
        }
      }
    }
  }, [pendingTopLevelB, pendingSubLevelB]);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton color={'grass'} variant={'soft'}>
          <PlusIcon />
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
                          {/*<Select.Group>*/}
                          {/*  <Select.Label>Fixed</Select.Label>*/}
                          {/*  <Select.Item key={`value`} value={'value'}>*/}
                          {/*    Value*/}
                          {/*  </Select.Item>*/}
                          {/*</Select.Group>*/}

                          {/*<Select.Item key={'trigger'} value={'trigger'}>*/}
                          {/*  entry*/}
                          {/*</Select.Item>*/}

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

              <Button className="!mt-3" variant={'soft'} onClick={addCondition}>
                Add Condition
              </Button>
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
