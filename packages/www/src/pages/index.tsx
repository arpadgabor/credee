import { Component } from 'solid-js'
import { Button, ButtonLink } from '../components/ui/Button'

const Index: Component = () => {
  return (
    <div class='p-8'>
      <div class='flex space-x-4'>
        <ButtonLink href='/overview'>Go to overview</ButtonLink>{' '}
      </div>
    </div>
  )
}

export default Index
