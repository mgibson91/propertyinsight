// TODO: Change defaultValue to value so it actually changes on save

import { Button, Card, Dialog, TextFieldInput, } from '@radix-ui/themes';
import { Editor } from "@monaco-editor/react";
import { UserTrigger } from "@/app/(logic)/types";

export const UserTriggerDialog = ({
  show,
  trigger,
  setTrigger,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  trigger: UserTrigger;
  setTrigger: (trigger: UserTrigger) => void;
  onSaveClicked: () => void;
  onCancelClicked: () => void;
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveClicked();
    }
  };

  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={'min-w-[90vw]'}>
        <Card>
          <div className={'flex flex-col gap-3'} onKeyDown={handleKeyDown}>
            <div className={'flex flex-row items-start justify-between gap-3'}>
              {/*Name?*/}
              <div className={'flex flex-col'}>
                <label>Trigger Name</label>
                <TextFieldInput
                  value={trigger.name}
                  onChange={(e) =>
                    setTrigger({
                      ...trigger,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className={'flex flex-col'}>
                <label>Color</label>
                <input
                  type="color"
                  id="head"
                  name="head"
                  value={trigger.color}
                  onChange={(e) =>
                    setTrigger({
                      ...trigger,
                      color: e.target.value,
                    })
                  }
                />
              </div>

              <div className={'flex flex-col items-start'}>
                <label>Size</label>
                <TextFieldInput
                  type={'number'}
                  value={trigger.size}
                  onChange={(e) =>
                    setTrigger({
                      ...trigger,
                      size: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className={'flex flex-col max-h-[400px] overflow-auto'}>
              <label>Trigger Function</label>

              <Editor
                height="90vh"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={trigger.triggerFunctionString}
                onChange={(value, event) => {
                  setTrigger({
                    ...trigger,
                    triggerFunctionString: value ?? 'data[0].close > data[0].sma',
                  })
                }}
              />

              {/*<TextArea*/}
              {/*  className={'w-[100%] !h-[500px]'}*/}
              {/*  placeholder={'return data;'}*/}
              {/*  value={trigger.triggerFunctionString}*/}
              {/*  onChange={(e) =>*/}
              {/*    setTrigger({*/}
              {/*      ...trigger,*/}
              {/*      triggerFunctionString: e.target.value,*/}
              {/*    })*/}
              {/*  }*/}
              {/*></TextArea>*/}

              {/*<CodeMirror*/}
              {/*  value={trigger.triggerFunctionString}*/}
              {/*  onChange={(value) => {*/}
              {/*    setTrigger({ ...trigger, triggerFunctionString: value });*/}
              {/*  }}*/}
              {/*  lazyLoadMode={false}*/}
              {/*  options={{*/}
              {/*    // theme: 'monokai',*/}
              {/*    tabSize: 2,*/}
              {/*    // keyMap: 'sublime',*/}
              {/*    mode: 'js',*/}
              {/*  }}*/}
              {/*/>*/}

              <div className={'flex justify-between mt-3'}>
                <Button
                  color="gray"
                  className={'w-32'}
                  onClick={() => onCancelClicked()}
                >
                  Cancel
                </Button>

                <Button className={'w-32'} onClick={() => onSaveClicked()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Dialog.Content>
    </Dialog.Root>
  );
};
