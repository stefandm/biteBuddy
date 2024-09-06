import Skeleton from 'react-loading-skeleton'

interface RecipeSkeletonProps {
    cards: number;
  }

const RecipeSkeleton:React.FC<RecipeSkeletonProps>  = ({cards}) => {
  return (
    Array(cards).fill(0).map((_item,index) =>(
        <div key={index} className='flex flex-col gap-1 shadow-lg rounded-lg' >
        <Skeleton height={280} />
        <Skeleton height={40}/>
        </div>
    ))
   
  )
}

export default RecipeSkeleton
