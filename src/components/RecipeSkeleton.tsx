import Skeleton from 'react-loading-skeleton'

interface RecipeSkeletonProps {
    cards: number;
  }

const RecipeSkeleton:React.FC<RecipeSkeletonProps>  = ({cards}) => {
  return (
    Array(cards).fill(0).map((_item,index) =>(
        <div key={index}className='flex flex-col gap-2 shadow-lg'>
        <Skeleton  height={350}/>
        <Skeleton height={30}/>
        <Skeleton height={30}/>
        </div>
    ))
   
  )
}

export default RecipeSkeleton
