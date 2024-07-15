import {
  Box,
  Button,
  Code,
  Dialog,
  Heading,
  IconButton,
  Popover,
  Select,
  Tabs,
  TextFieldInput,
} from '@radix-ui/themes';
import { Indicator, IndicatorParam, IndicatorParamType } from '@/logic/indicators/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React, { useEffect, useState } from 'react';
import { Editor, BeforeMount } from '@monaco-editor/react';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';
import { DEFAULT_FIELDS, getIndicatorStreamTags } from '@/app/(logic)/get-indicator-stream-tags';
import { PlusIcon, ReloadIcon, ResetIcon } from '@radix-ui/react-icons';
import { prependSpreadFunctions } from '@/logic/get-consolidated-series-new';
import { parseFunctionReturnKeys } from '@/app/(logic)/parse-function-return-key';

const DEFAULT_INDICATOR_USER_FUNCTION = `function indicator() {
  // Replace this example
  return {
    value1: 1,
    value2: 2,
  };
}
`;

export const EditorTab = ({
  existingIndicators,
  indicator,
  // setIndicator,
  onSaveToChartClicked,
  onSaveToLibraryClicked,
  onSaveToStrategyClicked,
}: {
  existingIndicators: Indicator[];
  indicator?: Indicator;
  // setIndicator: (indicator: Indicator) => void;
  // onSaveToChartClicked: (input: { funcStr: string; name: string; params: IndicatorParam[] }) => void;
  onSaveToChartClicked: (input: Omit<Indicator, 'overlay' | 'id'>) => void;
  onSaveToLibraryClicked: (input: Omit<Indicator, 'overlay' | 'id'>) => void; // TODO: Probs need id
  // onSaveToLibraryClicked: (input: { indicatorId?: string; funcStr: string; name: string }) => void;
  onSaveToStrategyClicked: (input: {
    strategyId?: string;
    indicatorId?: string;
    funcStr: string;
    name: string;
  }) => void;
}) => {
  const [funcStr, setFuncStr] = useState(DEFAULT_INDICATOR_USER_FUNCTION);
  const [label, setLabel] = useState('');
  const [tag, setTag] = useState('');
  const [params, setInputs] = useState<IndicatorParam[]>([]);

  const [functionStartValid, setFunctionValid] = useState(false);

  useEffect(() => {
    if (!indicator) {
      return;
    }
    setFuncStr(indicator.funcStr);
    setLabel(indicator.label);
    setTag(indicator.tag);
    setInputs(indicator.params);
  }, [indicator]);

  // const handleKeyDown = (event: React.KeyboardEvent) => {
  //   if (event.key === 'Enter' && event.ctrlKey) {
  //     event.preventDefault();
  //
  //
  //     onSaveToChartClicked({
  //       funcStr,
  //       label,
  //       params,
  //       // TODO
  //       tag: '',
  //       streams: [],
  //     });
  //   }
  // };

  // Define global variables before the editor mounts
  const beforeMount: BeforeMount = monaco => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });

    // It's right through indicators, and for each indicator at all streams
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      ${prependSpreadFunctions({
        funcString: prefixBuiltInFunctions(indicator ? indicator.funcStr : ''),
        params: indicator?.params || [],
        existingIndicatorMetadata: existingIndicators.flatMap(indicator =>
          indicator.streams.map(stream => ({
            streamTag: stream.tag,
            indicatorTag: indicator.tag,
          }))
        ),
      })}
      `
    );

    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark', // can also be vs-dark or hc-black
      inherit: true, // whether to inherit the base theme's rules
      rules: [], // you can override specific token styles here
      colors: {
        'editor.background': '#111113', // Set your desired background color here
        // You can set other colors as needed
      },
    });

    monaco.editor.onDidChangeMarkers(([uri]) => {
      const markers = monaco.editor.getModelMarkers({ resource: uri });
      console.log(markers);
    });

    // Apply the custom theme
    monaco.editor.setTheme('myCustomTheme');
  };

  const FIELD_OPTIONS = [
    ...DEFAULT_FIELDS,
    ...(indicator ? getIndicatorStreamTags(indicator, existingIndicators) : []),
  ];

  useEffect(() => {
    if (!funcStr.startsWith('function indicator() {')) {
      setFunctionValid(false);
      return;
    }
    setFunctionValid(true);
  }, [funcStr]);

  return (
    //  onKeyDown={handleKeyDown}
    <div className={'flex flex-col'}>
      <div className={'flex flex-row items-center justify-between bg-accent-bg h-[36px] px-2'}>
        <div className={'flex flex-row gap-2 items-center px-1'}>
          <TextFieldInput
            size={'1'}
            className={'min-w-[150px]'}
            placeholder={'Indicator name'}
            value={label}
            onInput={e => {
              setLabel(e.target.value);
            }}
          ></TextFieldInput>

          <TextFieldInput
            size={'1'}
            className={'min-w-[150px]'}
            placeholder={'Indicator tag'}
            value={tag}
            onInput={e => {
              setTag(e.target.value);
            }}
          ></TextFieldInput>

          <IconButton
            variant={'ghost'}
            onClick={() => {
              setFuncStr(DEFAULT_INDICATOR_USER_FUNCTION);
              setLabel('');
              setTag('');
              setInputs([]);
            }}
          >
            <ReloadIcon></ReloadIcon>
          </IconButton>
        </div>

        {!functionStartValid && (
          <Popover.Root>
            <Popover.Trigger>
              <Button color="tomato" size={'1'} variant={'solid'}>
                Syntax Error
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <p>Function must start with:</p>
              <Code className="whitespace-pre-line">{`function indicator() {`}</Code>
            </Popover.Content>
          </Popover.Root>
        )}

        <div className={'flex flex-row gap-2 items-center'}>
          <Button
            disabled={true}
            size={'1'}
            className={'w-32'}
            onClick={() => {
              const keys = parseFunctionReturnKeys(funcStr);
              console.log(keys);

              onSaveToChartClicked({
                funcStr,
                label,
                params: params.map(param => ({
                  ...param,
                  name: param.name.toLowerCase(),
                })),
                // TODO
                tag,
                streams: keys.map(key => ({
                  tag: key,
                  overlay: false,
                  color: 'yellow',
                  lineWidth: 1,
                })),
                properties: keys,
              });
            }}
            variant={'outline'}
          >
            Save to library
          </Button>

          <Button
            size={'1'}
            className={'w-32'}
            onClick={() => {
              const keys = parseFunctionReturnKeys(funcStr);
              console.log(keys);

              onSaveToChartClicked({
                funcStr,
                label,
                params: params.map(param => ({
                  ...param,
                  name: param.name.toLowerCase(),
                })),
                // TODO
                tag,
                streams: keys.map(key => ({
                  tag: key,
                  overlay: true,
                  color: 'white',
                  lineWidth: 1,
                })),
                properties: keys,
              });
            }}
          >
            Save to chart
          </Button>
        </div>
      </div>
      <div className={'flex flex-row p-2'}>
        <div className={'flex flex-col w-[450px]'}>
          <div className={'flex flex-row items-center justify-between'}>
            <Heading size={'3'} className={'mb-3'}>
              Inputs
            </Heading>

            <IconButton
              variant={'ghost'}
              className={'!rounded-full !m-0'}
              size={'1'}
              onClick={() => {
                setInputs([
                  ...params,
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
            {params.map((param, index) => (
              <>
                <div className={'flex flex-col gap-1'}>
                  <div className={'flex flex-row gap-2 items-center'}>
                    <Select.Root
                      value={param.type}
                      onValueChange={(type: IndicatorParamType) => {
                        setInputs(
                          params.map((p, i) => {
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
                          params.map((p, i) => {
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
                        placeholder="Default"
                        onChange={e =>
                          setInputs(
                            params.map((p, i) => {
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
                            params.map((p, i) => {
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
                            params.map((p, i) => {
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
                        setInputs(params.filter((_, i) => i !== index));
                      }}
                    >
                      <CloseIcon></CloseIcon>
                    </IconButton>
                  </div>
                </div>
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
