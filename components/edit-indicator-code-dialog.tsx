import { Box, Button, Code, Dialog, Heading, IconButton, Select, Tabs, TextFieldInput } from '@radix-ui/themes';
import { Indicator, IndicatorTag } from '@/logic/indicators/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React, { useEffect, useState } from 'react';
import { Editor, BeforeMount } from '@monaco-editor/react';
import { prefixBuiltInFunctions } from '@/logic/built-in-functions/aggregations/prefix-built-in-functions';
import { prependSpreadFunctions } from '@/logic/get-consolidated-series-new';

export const EditIndicatorCodeDialog = ({
  show,
  existingIndicators,
  indicator,
  // setIndicator,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  existingIndicators: Indicator[];
  indicator?: Indicator;
  // setIndicator: (indicator: Indicator) => void;
  onSaveClicked: (funcStr: string) => void;
  onCancelClicked: () => void;
}) => {
  const [funcStr, setFuncStr] = useState('');

  useEffect(() => {
    if (!indicator) {
      return;
    }

    setFuncStr(indicator.funcStr);
  }, [indicator]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveClicked(funcStr);
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
        funcString: prefixBuiltInFunctions(indicator ? indicator.funcStr : ''),
        existingIndicatorMetadata: existingIndicators.flatMap(indicator =>
          indicator.streams.map(stream => ({
            streamTag: stream.tag,
            indicatorTag: indicator.tag as IndicatorTag,
          }))
        ),
      })}
      `);
  };

  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={''}>
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
            theme="vs-dark"
            beforeMount={beforeMount}
          />

          <div className={'flex flex-col max-h-[400px] overflow-auto gap-3'}>
            <div className={'flex justify-between mt-3'}>
              <Button color="gray" className={'w-32'} onClick={() => onCancelClicked()}>
                Cancel
              </Button>

              {/*<Button className={'w-32'} onClick={() => onSaveClicked(funcStr)}>*/}
              {/*  Save*/}
              {/*</Button>*/}

              <div className={'flex flex-row gap-2 items-center'}>
                <Button className={'w-32'} onClick={() => onSaveClicked(funcStr)} variant={'outline'}>
                  Save to library
                </Button>

                <Button className={'w-32'} onClick={() => onSaveClicked(funcStr)}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
