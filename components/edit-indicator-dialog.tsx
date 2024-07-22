import { Button, Code, Dialog, Heading, IconButton, Select, Tabs, TextField } from '@radix-ui/themes';
import { Indicator } from '@/logic/indicators/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React from 'react';

function getIndicatorStreamTags(indicator: Indicator, existingIndicators: Indicator[]): string[] {
  const index = existingIndicators.findIndex(i => i.tag === indicator.tag);
  if (index === -1) {
    return [];
  }

  return existingIndicators.slice(0, index).flatMap(i => i.streams.map(s => `${i.tag}_${s.tag}`));
}

const DEFAULT_FIELDS = ['open', 'high', 'low', 'close']; // TODO: Make configurable for multi domain

export const EditIndicatorDialog = ({
  show,
  existingIndicators,
  indicator,
  setIndicator,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  existingIndicators: Indicator[];
  indicator: Indicator;
  setIndicator: (indicator: Indicator) => void;
  onSaveClicked: () => void;
  onCancelClicked: () => void;
}) => {
  const FIELD_OPTIONS = [...DEFAULT_FIELDS, ...getIndicatorStreamTags(indicator, existingIndicators)];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveClicked();
    }
  };

  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={'!max-w-[350px]'}>
        <div className={'flex flex-col gap-3'} onKeyDown={handleKeyDown}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'6'}>Edit Indicator</Heading>
            <IconButton
              variant={'ghost'}
              className={'!rounded-full'}
              size={'1'}
              onClick={() => {
                onCancelClicked();
              }}
            >
              <CloseIcon></CloseIcon>
            </IconButton>
          </div>

          <Tabs.Root defaultValue="inputs">
            <Tabs.List>
              <Tabs.Trigger value="inputs">Inputs</Tabs.Trigger>
              <Tabs.Trigger value="style">Style</Tabs.Trigger>
            </Tabs.List>

            <div>
              <Tabs.Content value="inputs">
                <div className={'flex flex-col gap-2 p-3'}>
                  {indicator.params.map((param, index) => {
                    return (
                      <div key={index} className={'flex flex-row gap-2 items-center justify-between'}>
                        <label>{param.name}</label>
                        {param.type === 'number' && (
                          <TextField.Root
                            className={'!w-32'}
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={indicator.params[index].value}
                            onChange={e =>
                              setIndicator({
                                ...indicator,
                                params: indicator.params.map((p, i) => {
                                  if (i === index) {
                                    let value: string | number | null = e.target.value;
                                    if (param.type === 'number') {
                                      const parsed = parseInt(e.target.value);
                                      value = isNaN(parsed) ? null : parsed;
                                    }

                                    return {
                                      ...p,
                                      value,
                                    };
                                  }
                                  return p;
                                }),
                              })
                            }
                          />
                        )}

                        {param.type === 'field' && (
                          <Select.Root
                            value={param.value as string}
                            onValueChange={value => {
                              setIndicator({
                                ...indicator,
                                params: indicator.params.map((p, i) => {
                                  if (i === index) {
                                    return {
                                      ...p,
                                      value,
                                    };
                                  }
                                  return p;
                                }),
                              });
                            }}
                          >
                            <Select.Trigger
                              placeholder="Select ticker"
                              className={'bg-primary-bg-subtle h-[32px] w-32'}
                            />
                            <Select.Content>
                              {FIELD_OPTIONS.map(option => (
                                <Select.Item key={option} value={option}>
                                  {option}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Tabs.Content>

              <Tabs.Content value="style">
                <div className={'flex flex-col gap-2 p-3'}>
                  {indicator.streams.map((stream, index) => {
                    return (
                      <div key={index} className={'flex flex-row gap-2 items-center justify-between'}>
                        <Code size={'1'}>{stream.tag}</Code>
                        <input
                          type="color"
                          id="head"
                          name="head"
                          value={stream.color}
                          onChange={e =>
                            setIndicator({
                              ...indicator,
                              streams: indicator.streams.map((s, i) => {
                                if (i === index) {
                                  return {
                                    ...s,
                                    color: e.target.value,
                                  };
                                }
                                return s;
                              }),
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>

          <div className={'flex flex-col max-h-[400px] overflow-auto gap-3'}>
            <div className={'flex justify-between mt-3'}>
              <Button color="gray" className={'w-32'} onClick={() => onCancelClicked()}>
                Cancel
              </Button>

              <Button className={'w-32'} onClick={() => onSaveClicked()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
