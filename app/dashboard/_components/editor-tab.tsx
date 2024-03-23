import { Box, Button, Code, Dialog, Heading, IconButton, Select, Tabs, TextFieldInput } from '@radix-ui/themes';
import { Indicator, IndicatorParam, IndicatorParamType } from '@/logic/indicators/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React, { useEffect, useState } from 'react';
import { Editor, BeforeMount } from '@monaco-editor/react';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';
import { IndicatorStreamData, prependSpreadFunctions } from '@/app/(logic)/get-consolidated-series';
import { DEFAULT_FIELDS, getIndicatorStreamTags } from '@/app/(logic)/get-indicator-stream-tags';
import { PlusIcon } from '@radix-ui/react-icons';

export const EditorTab = ({
  existingIndicators,
  indicator,
  setIndicator,
  onSaveToChartClicked,
  onSaveToLibraryClicked,
  onSaveToStrategyClicked,
}: {
  existingIndicators: Indicator[];
  indicator: Indicator;
  setIndicator: (indicator: Indicator) => void;
  onSaveToChartClicked: (input: { funcStr: string; name: string; inputs: IndicatorParam[] }) => void;
  onSaveToLibraryClicked: (input: { indicatorId?: string; funcStr: string; name: string }) => void;
  onSaveToStrategyClicked: (input: {
    strategyId?: string;
    indicatorId?: string;
    funcStr: string;
    name: string;
  }) => void;
}) => {
  const [funcStr, setFuncStr] = useState('');
  const [name, setName] = useState('');
  const [inputs, setInputs] = useState<IndicatorParam[]>([]);

  useEffect(() => {
    setFuncStr(indicator.funcStr);
    setName(indicator.label);
    setInputs(indicator.params);
  }, [indicator]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveToChartClicked({ funcStr, name, inputs });
    }
  };

  // Define global variables before the editor mounts
  const beforeMount: BeforeMount = monaco => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });

    // declare var existingIndicators: ${JSON.stringify(existingIndicators)};

    // TODO: Something with prependSpreadFunctions(prefixBuiltInFunctions(indicator.funcStr), indicator, existingIndicatorStreams)

    // It's right through indicators, and for each indicator at all streams
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
      ${prependSpreadFunctions({
        funcString: prefixBuiltInFunctions(indicator.funcStr),
        indicator,
        existingIndicatorMetadata: existingIndicators.flatMap(indicator =>
          indicator.streams.map(stream => ({
            streamTag: stream.tag,
            indicatorTag: indicator.tag,
          }))
        ),
      })}
      `);

    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark', // can also be vs-dark or hc-black
      inherit: true, // whether to inherit the base theme's rules
      rules: [], // you can override specific token styles here
      colors: {
        'editor.background': '#111113', // Set your desired background color here
        // You can set other colors as needed
      },
    });

    // Apply the custom theme
    monaco.editor.setTheme('myCustomTheme');
  };

  const FIELD_OPTIONS = [...DEFAULT_FIELDS, ...getIndicatorStreamTags(indicator, existingIndicators)];

  return (
    <div className={'flex flex-col gap-3 p-3'} onKeyDown={handleKeyDown}>
      <div className={'flex flex-row items-center justify-between'}>
        <TextFieldInput
          className={'min-w-[200px]'}
          placeholder={'Indicator name'}
          value={name}
          onInput={e => {
            setName(e.target.value);
          }}
        ></TextFieldInput>

        <div className={'flex flex-row gap-2 items-center'}>
          <Button
            className={'w-32'}
            onClick={() =>
              onSaveToChartClicked({
                funcStr,
                name,
                inputs,
              })
            }
            variant={'outline'}
          >
            Save to library
          </Button>

          <Button
            className={'w-32'}
            onClick={() =>
              onSaveToChartClicked({
                funcStr,
                name,
                inputs,
              })
            }
          >
            Save to chart
          </Button>
        </div>
      </div>
      <div className={'flex flex-row'}>
        <div className={'flex flex-col w-[450px]'}>
          <div className={'flex flex-row items-center justify-between py-1'}>
            <Heading size={'3'} className={'mb-3'}>
              Inputs
            </Heading>

            <IconButton
              variant={'ghost'}
              className={'!rounded-full !m-0'}
              size={'1'}
              onClick={() => {
                setInputs([
                  ...inputs,
                  {
                    name: '',
                    type: IndicatorParamType.NUMBER,
                    label: '',
                    required: true,
                    defaultValue: '',
                    value: '',
                  },
                ]);
              }}
            >
              <PlusIcon></PlusIcon>
            </IconButton>
          </div>

          <div className={'flex flex-col gap-2'}>
            {inputs.map((param, index) => (
              <>
                {param.name !== 'length' && (
                  <div className={'flex flex-col gap-1'}>
                    <div className={'flex flex-row gap-2 items-center'}>
                      <Select.Root
                        value={param.type}
                        onValueChange={(type: IndicatorParamType) => {
                          setInputs(
                            inputs.map((p, i) => {
                              if (i === index) {
                                return {
                                  ...p,
                                  type,
                                };
                              }
                              return p;
                            })
                          );
                        }}
                      >
                        <Select.Trigger
                          placeholder="Type"
                          className={'bg-primary-bg-subtle w-[100px]'}
                          variant={'soft'}
                        />
                        <Select.Content>
                          {Object.values(IndicatorParamType).map(type => (
                            <Select.Item key={type} value={type}>
                              {type}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>

                      <TextFieldInput
                        className={'w-[100px]'}
                        value={param.name}
                        onChange={e =>
                          setInputs(
                            inputs.map((p, i) => {
                              if (i === index) {
                                return {
                                  ...p,
                                  name: e.target.value,
                                };
                              }
                              return p;
                            })
                          )
                        }
                      />

                      {/* Default value*/}
                      {param.type === IndicatorParamType.NUMBER ? (
                        <TextFieldInput
                          className={'w-[100px]'}
                          type={'number'}
                          value={param.defaultValue as number}
                          onChange={e =>
                            setInputs(
                              inputs.map((p, i) => {
                                if (i === index) {
                                  return {
                                    ...p,
                                    defaultValue: parseInt(e.target.value),
                                  };
                                }
                                return p;
                              })
                            )
                          }
                        />
                      ) : param.type === IndicatorParamType.FIELD ? (
                        <Select.Root
                          value={param.defaultValue as string}
                          onValueChange={value =>
                            setInputs(
                              inputs.map((p, i) => {
                                if (i === index) {
                                  return {
                                    ...p,
                                    defaultValue: value,
                                  };
                                }
                                return p;
                              })
                            )
                          }
                        >
                          <Select.Trigger
                            placeholder="Select ticker"
                            className={'bg-primary-bg-subtle h-[32px] w-[100px]'}
                          />
                          <Select.Content>
                            {FIELD_OPTIONS.map(option => (
                              <Select.Item key={option} value={option}>
                                {option}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      ) : (
                        <TextFieldInput
                          className={'w-[100px]'}
                          value={param.defaultValue as string}
                          onChange={e =>
                            setInputs(
                              inputs.map((p, i) => {
                                if (i === index) {
                                  return {
                                    ...p,
                                    defaultValue: e.target.value,
                                  };
                                }
                                return p;
                              })
                            )
                          }
                        />
                      )}

                      <IconButton
                        variant={'ghost'}
                        color="tomato"
                        className={'!rounded-full !m-0 !h-3 !w-3'}
                        size={'1'}
                        onClick={() => {
                          setInputs(inputs.filter((_, i) => i !== index));
                        }}
                      >
                        <CloseIcon></CloseIcon>
                      </IconButton>
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
        <Editor
          height="50vh"
          options={{
            language: 'typescript',
            minimap: {
              enabled: false,
            },
          }}
          defaultLanguage="typescript"
          value={funcStr}
          onChange={(value, event) => {
            setFuncStr(value || '');
          }}
          theme="myCustomTheme"
          beforeMount={beforeMount}
        />
      </div>
    </div>
  );
};
