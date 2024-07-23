import { useEffect, useState } from 'react';
import { Button, Checkbox, Dialog, Heading, IconButton, SegmentedControl, Select, TextField } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { TransformOperator, TransformType, TriggerCondition } from '@/components/triggers/edit-trigger';
import { DefaultOperatorType } from '@/logic/indicators/types';

const DEFAULT_CONDITION: TriggerCondition = {
  fieldA: {
    property: 'close',
    offset: 0,
  },
  operator: {
    type: 'crossover',
    custom: false,
  },
  fieldB: {
    property: 'close',
    offset: 0,
  },
};

export const AddConditionPopover = ({
  properties,
  operators,
  addCondition,
  includeTrigger,
}: {
  properties: {
    default: string[];
    indicator: { indicatorTag: string; streamTag: string[] }[];
  };
  operators: { label: string; func: string }[];
  addCondition: (condition: TriggerCondition) => void;
  includeTrigger?: boolean; // Refactor
}) => {
  const [pendingCondition, setPendingCondition] = useState<TriggerCondition>(DEFAULT_CONDITION);

  const [pendingTopLevelA, setPendingTopLevelA] = useState<string>('close');
  const [pendingSubLevelA, setPendingSubLevelA] = useState<string>();
  const [pendingTopLevelB, setPendingTopLevelB] = useState<string>('close');
  const [pendingSubLevelB, setPendingSubLevelB] = useState<string>();
  const [transformEnabled, setTransformEnabled] = useState(false);
  const [transformOptions, setTransformOptions] = useState<{
    operator: TransformOperator;
    value: number;
    type: TransformType;
  }>({
    operator: '+',
    value: 2,
    type: 'percent',
  });

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
    } else if (pendingTopLevelB.startsWith('trigger.')) {
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
    <>
      <Dialog.Root>
        <Dialog.Trigger>
          <IconButton color={'grass'} variant={'soft'}>
            <PlusIcon />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <div className={'flex flex-col'}>
            <div className={'flex flex-row items-center justify-between'}>
              <Heading size={'4'}>Add Condition</Heading>
              <Dialog.Close>
                <IconButton variant={'ghost'} color={'gray'} className={'!rounded-full !m-0'}>
                  <Cross2Icon />
                </IconButton>
              </Dialog.Close>
            </div>

            <div className="my-2">
              <div className={'flex flex-col gap-2'}>
                <div className={'w-full flex gap-5'}>
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
                    <TextField.Root
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
                    ></TextField.Root>
                  </div>
                </div>

                <Heading size={'3'}>Operator</Heading>
                <Select.Root
                  value={pendingCondition.operator.type}
                  onValueChange={value => {
                    setPendingCondition({
                      ...pendingCondition,
                      operator: {
                        type: value as DefaultOperatorType,
                        custom: false,
                      },
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

                <div className={'w-full flex gap-5'}>
                  <div className={'flex flex-col flex-1 '}>
                    <div className={'flex flex-row items-center justify-between'}>
                      <Heading size={'3'}>Field B</Heading>
                      <div className={'flex flex-row items-center gap-2'}>
                        <p className="text-primary-text">Transform</p>
                        <Checkbox
                          checked={transformEnabled}
                          onCheckedChange={() => setTransformEnabled(!transformEnabled)}
                          className="border border-primary-border !cursor-pointer"
                        />
                      </div>
                    </div>

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

                            {includeTrigger && (
                              <Select.Group>
                                <Select.Label>Trigger</Select.Label>
                                <Select.Item key={'trigger'} value={'trigger.close'}>
                                  trigger.close
                                </Select.Item>
                              </Select.Group>
                            )}

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
                    <TextField.Root
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

                {transformEnabled && (
                  <div className={'flex flex-row flex-1 gap-2'}>
                    <SegmentedControl.Root
                      value={transformOptions.operator}
                      onValueChange={(value: TransformOperator) => {
                        setTransformOptions({
                          ...transformOptions,
                          operator: value,
                        });
                      }}
                    >
                      <SegmentedControl.Item value="+" className={'!rounded-l'}>
                        +
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="-" className={'!rounded-r'}>
                        -
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>

                    <TextField.Root
                      className="flex-1"
                      value={transformOptions.value}
                      onChange={e => {
                        setTransformOptions({
                          ...transformOptions,
                          value: Number(e.target.value),
                        });
                      }}
                    />

                    <SegmentedControl.Root
                      value={transformOptions.type}
                      onValueChange={(value: TransformType) => {
                        setTransformOptions({
                          ...transformOptions,
                          type: value,
                        });
                      }}
                    >
                      <SegmentedControl.Item value="percent" className={'!rounded-l'}>
                        %
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="absolute" className={'!rounded-r'}>
                        $
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </div>
                )}

                <Dialog.Close>
                  <Button
                    className="!mt-3"
                    variant={'soft'}
                    onClick={() => {
                      const newCondition = {
                        ...pendingCondition,
                        fieldBTransform: transformEnabled ? transformOptions : undefined,
                      };

                      setPendingCondition(newCondition);
                      addCondition(newCondition);
                    }}
                  >
                    Add Condition
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
