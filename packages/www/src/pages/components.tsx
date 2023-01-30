import { Button, FormRow, Input, Select } from '../components/ui'

export default function Components() {
  const options = [
    { label: '1asdad', value: '1' },
    { label: '1asdadasd', value: '2' },
    { label: '1asfadsadasd', value: '3' },
    { label: '1asdad', value: '4' },
  ]
  return (
    <div class='flex flex-col divide-y divide-gray-200 w-full px-8'>
      <div class='flex space-x-4 py-8'>
        <Button theme='main'>My button</Button>
        <Button theme='accent'>My button</Button>
      </div>
      <div class='flex space-x-4 py-8'>
        <div>
          <Select options={options} label={'asd'} name='asd' placeholder='asdadas' class='w-full' />
        </div>
      </div>
      <div class='flex space-x-4 py-8'>
        <Input type='text' name='test' />
      </div>
      <div class='flex space-x-4 py-8'>
        <FormRow>
          <Select options={options} label={'asd'} name='asd' placeholder='asdadas' class='w-32' />
          <Input type='text' name='test' />
        </FormRow>
      </div>
    </div>
  )
}
