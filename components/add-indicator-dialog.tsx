import {
  Button,
  Card,
  Checkbox,
  Code,
  Dialog,
  Heading,
  HoverCard,
  IconButton,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';

import { Editor } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import { Indicator } from '@/logic/indicators/types';
import IndicatorSearchView from '@/components/indicators/add-indicator';
import { PRESET_INDICATORS } from '@/logic/indicators/preset-indicator';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React from 'react';

export const AddIndicatorDialog = ({
  show,
  onIndicatorSelected,
  onClose,
}: {
  show: boolean;
  onIndicatorSelected: (indicator: Indicator) => void;
  onClose: () => void;
}) => {
  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={''}>
        <div className={'flex flex-col gap-3'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'3'}>Add Indicator</Heading>
            <IconButton
              variant={'ghost'}
              className={'!rounded-full'}
              size={'1'}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon></CloseIcon>
            </IconButton>
          </div>
          <IndicatorSearchView
            indicators={PRESET_INDICATORS}
            onItemClicked={(indicator: Indicator) => {
              onIndicatorSelected(indicator);
            }}
          />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

// export const UserIndicatorDialog = ({
//   show,
//   indicator,
//   setIndicator,
//   onSaveClicked,
//   onCancelClicked,
// }: {
//   show: boolean;
//   indicator: Indicator & { overlay: boolean; color: string; lineWidth: 1 | 2 | 3 | 4 };
//   setIndicator: (indicator: Indicator & { overlay: boolean; color: string; lineWidth: 1 | 2 | 3 | 4 }) => void;
//   onSaveClicked: () => void;
//   onCancelClicked: () => void;
// }) => {
//   const handleKeyDown = (event: React.KeyboardEvent) => {
//     if (event.key === 'Enter' && event.ctrlKey) {
//       event.preventDefault();
//       onSaveClicked();
//     }
//   };
//
//   return (
//     <Dialog.Root open={show}>
//       <Dialog.Content className={'min-w-[90vw]'}>
//         <Card>
//           <div className={'flex flex-col gap-3'} onKeyDown={handleKeyDown}>
//             <div className={'flex flex-row items-start justify-between gap-3'}>
//               <div className={'flex flex-row gap-2 items-center'}>
//                 <div className={'flex flex-col'}>
//                   <label>Indicator Name</label>
//                   {/*<TextFieldInput*/}
//                   {/*  value={indicator.id}*/}
//                   {/*  onChange={e =>*/}
//                   {/*    setIndicator({*/}
//                   {/*      ...indicator,*/}
//                   {/*      : e.target.value,*/}
//                   {/*    })*/}
//                   {/*  }*/}
//                   {/*/>*/}
//                 </div>
//
//                 <div className={'flex flex-col'}>
//                   <label>Preset Indicator</label>
//                   {/*<TextFieldInput*/}
//                   {/*  value={indicator.name}*/}
//                   {/*  onChange={e =>*/}
//                   {/*    setIndicator({*/}
//                   {/*      ...indicator,*/}
//                   {/*      name: e.target.value,*/}
//                   {/*    })*/}
//                   {/*  }*/}
//                   {/*/>*/}
//                 </div>
//               </div>
//
//               <div className={'flex flex-row items-center gap-3'}>
//                 <div className={'flex flex-row gap-2 items-center'}>
//                   <label>Overlay</label>
//
//                   <Checkbox
//                     variant={'soft'}
//                     className="border border-primary-border !cursor-pointer"
//                     checked={indicator.overlay}
//                     onClick={() => {
//                       setIndicator({
//                         ...indicator,
//                         overlay: !indicator.overlay,
//                       });
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//
//             <div className={'flex flex-col'}>
//               <label>Color</label>
//               <input
//                 type="color"
//                 id="head"
//                 name="head"
//                 value={indicator.color}
//                 onChange={e =>
//                   setIndicator({
//                     ...indicator,
//                     color: e.target.value,
//                   })
//                 }
//               />
//             </div>
//
//             <div className={'flex flex-col items-start'}>
//               <label>Line width</label>
//               <TextFieldInput
//                 type={'number'}
//                 value={indicator.lineWidth}
//                 onChange={e =>
//                   setIndicator({
//                     ...indicator,
//                     lineWidth: parseInt(e.target.value) as 1 | 2 | 3 | 4,
//                   })
//                 }
//               />
//             </div>
//
//             <div className={'flex flex-col max-h-[400px] overflow-auto gap-3'}>
//               <div className={'flex flex-row justify-between'}>
//                 <label>Indicator Function</label>
//                 <div className={'flex flex-row'}>
//                   <HoverCard.Root>
//                     <HoverCard.Trigger>
//                       <Heading size={'3'} className={'cursor-pointer text-accent-text hover:text-accent-text-contrast'}>
//                         Syntax guide
//                       </Heading>
//                     </HoverCard.Trigger>
//                     <HoverCard.Content>
//                       <div className={'flex flex-col gap-1'}>
//                         <Editor
//                           height="50vh"
//                           width={'50vw'}
//                           options={{
//                             readOnly: true,
//                             language: 'typescript',
//                             minimap: {
//                               enabled: false,
//                             },
//                           }}
//                           defaultLanguage="typescript"
//                           defaultValue={`type Indicator = {
//   time: number; // unix timestamp
//   value: number;
// }[]
//
// function indicatorFunction(
//   open: Indicator,
//   high: Indicator,
//   low: Indicator,
//   close: Indicator
// ): Indicator {
//
//   /** YOUR IMPLEMENTATION HERE */
//   return close
// }
// `}
//                           theme="vs-dark"
//                         />
//                       </div>
//                     </HoverCard.Content>
//                   </HoverCard.Root>
//                 </div>
//               </div>
//
//               {/*              <Editor*/}
//               {/*                height="90vh"*/}
//               {/*                defaultLanguage="javascript"*/}
//               {/*                value={indicator.indicatorFunctionString}*/}
//               {/*                defaultValue={`const windowSize = 20;  // Setting the period for SMA*/}
//
//               {/*const smaData = data.map((current, index) => {*/}
//               {/*  if (index >= windowSize - 1) {*/}
//               {/*    // Calculate SMA only when there are enough preceding data points*/}
//               {/*    let sum = 0;*/}
//               {/*    // Sum the closing prices of the last 'windowSize' days*/}
//               {/*    for (let i = index - windowSize + 1; i <= index; i++) {*/}
//               {/*      sum += data[i].close;*/}
//               {/*    }*/}
//               {/*    let average = sum / windowSize;*/}
//               {/*    return { time: current.time, value: average };*/}
//               {/*  } else {*/}
//               {/*    return null;  // Not enough data to calculate SMA*/}
//               {/*  }*/}
//               {/*});*/}
//
//               {/*// Filter out the null entries, similar to your offset example*/}
//               {/*return smaData.filter(item => item !== null);`}*/}
//               {/*                theme="vs-dark"*/}
//               {/*                onChange={(value, event) => {*/}
//               {/*                  setIndicator({*/}
//               {/*                    ...indicator,*/}
//               {/*                    indicatorFunctionString: value || 'data[0].close > data[0].sma',*/}
//               {/*                  });*/}
//               {/*                }}*/}
//               {/*              />*/}
//
//               <div className={'flex justify-between mt-3'}>
//                 <Button color="gray" className={'w-32'} onClick={() => onCancelClicked()}>
//                   Cancel
//                 </Button>
//
//                 <Button className={'w-32'} onClick={() => onSaveClicked()}>
//                   Save
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </Dialog.Content>
//     </Dialog.Root>
//   );
// };
