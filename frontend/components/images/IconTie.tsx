import React from 'react'

export default ({
  width = '10', height = '21', className,
} : {
  width?: string, height?: string, className?: string}) => (
    <svg width={ width } height={ height } className={ className } viewBox='0 0 10 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M1.08219 16.9401L4.94521 19.9288C5 19.9763 5.05479 20 5.13699 20C5.19178 20 5.27397 19.9763 5.32877 19.9288L8.91781 16.9875C8.9726 16.9401 9 16.8689 9 16.774L7.10959 5.41199C7.54794
    5.36454 7.93151 5.05618 7.9863 4.65293L8.36986 1.90137C8.39726 1.66417 8.31507 1.45069 8.15068 1.26092C7.9863 1.09488 7.71233 1 7.43836 1H2.58904C2.31507 1 2.06849 1.09488 1.87671 1.26092C1.71233
    1.42697 1.60274 1.66417 1.65753 1.90137L2.0411 4.65293C2.09589 5.05618 2.45205 5.36454 2.91781 5.41199L1 16.7266C1 16.8215 1.0274 16.8926 1.08219 16.9401Z'
        stroke='#DA6D30'
        strokeMiterlimit='10'
      />
      <path d='M1.5 14L9 17' stroke='#DA6D30' strokeWidth='0.5' />
      <path d='M3 6.5L7.5 8' stroke='#DA6D30' strokeWidth='0.5' />
      <path d='M2.5 9L8 11' stroke='#DA6D30' strokeWidth='0.5' />
      <path d='M2 11.5L8.5 14' stroke='#DA6D30' strokeWidth='0.5' />
    </svg>
)
